---
title: Adding passkeys to a Supabase app
description:
  Adding passkeys to a Supabase app without using third party solutions.
date: 2024-08-30
---

# Adding passkeys to a Supabase app without using third parties

Recently I added passkeys to a minimal Next.js application using Supabase as the
backend.

Supabase Auth makes it incredibly easy to implement user management in your
application. It supports SSO, multi-factor authentication as well as traditional
password authentication out of the box. However, at the time of writing it does
not support signing in with passkeys.

Supabase does make it possible to issue your own JWTs to your users. So
theoretically it is possible to implement a custom authentication method. So I
figured if could implement passkey registration and authentication flows, then I
could simply issue a custom JWT and let the user sign in once their passkey has
been successfully verified.

When I was doing research for this I came across many third-party solutions that
claim to support passkey authentication with Supabase. I was hesitant to use
them, however, as it seems they also want to be the system of record for your
users. I preferred not to go down this route and I was also curious to see how
straightforward it would be to implement passkeys manually. Thankfully there is
an open source library called [SimpleWebAuthn](https://simplewebauthn.dev) that
takes care of most of the logic.

My basic requirements were:

1. Use Supabase Auth to manage users.

   Existing users should still be able to sign in with their password, managed
   by Supabase.

2. Integrate with Supabase Row Level Security.

   This means that interacting with Supabase as an authenticated user should use
   a user token instead of a service role token.

3. Enable new and exising users to continue to use passwords or other sign-in
   methods.

   At the moment passkeys are advertised to end users as an optional
   convenience. Users should not feel obliged to adopt them. Additionally, it is
   important to maintain existing sign-in methods for account recovery flows.

4. Automatically refresh the user's session.

   The custom access token should be automatically refreshed to mirror the
   default behaviour of a Supabase-managed session.

Here's how I did it...

## Application setup

To create the base application I followed the
[official guide](https://supabase.com/docs/guides/getting-started/quickstarts/nextjs)
for using Supabase with Next.js. I implemented sign up, sign in, sign out and
reset password flows.

## The database schema

We're going to need two new database tables to implement passkeys. One for the
passkey data itself, and another to store the unique challenges.

I created a new schema in the Supabase database called `webauthn` to act as a
namespace for everything related to the WebAuthn specification.

> Note: A quick note on terminology. The word "passkey" is a common noun like
> "password". It doesn't refer to any particular specification or data
> structure. The specification that defines how user agents (browsers),
> authenticators (e.g. Face ID) and relying parties (servers) is called
> WebAuthn. The WebAuthn specification describes multiple types of credentials
> that can be used to authenticate users. A passkey is a public-key credential
> that is discoverable.

First create the schema:

```sql
create schema webauthn;
```

The `credentials` table will store public key information once they have been
verified. This corresponds to the
[Credential Record](https://www.w3.org/TR/webauthn-3/#credential-record) in the
specification.

```sql
create type webauthn.credential_type AS ENUM ('public-key');
create type webauthn.user_verification_status AS ENUM ('unverified', 'verified');
create type webauthn.device_type AS ENUM ('single_device', 'multi_device');
create type webauthn.backup_state AS ENUM ('not_backed_up', 'backed_up');

create table webauthn.credentials (
  id                       uuid not null default gen_random_uuid(),
  user_id                  uuid not null default auth.uid(),
  friendly_name            text,
  credential_type          webauthn.credential_type not null,
  credential_id            varchar not null,
  public_key               bytea not null,
  aaguid                   varchar default '00000000-0000-0000-0000-000000000000'::varchar not null,
  sign_count               integer not null,
  transports               text[] not null,
  user_verification_status webauthn.user_verification_status not null,
  device_type              webauthn.device_type not null,
  backup_state             webauthn.backup_state not null,
  created_at               timestamptz default now() not null,
  updated_at               timestamptz default now() not null,
  last_used_at             timestamptz,
  constraint credentials_pkey primary key (id),
  constraint credentials_credential_id_key unique (credential_id),
  constraint credentials_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

create unique index credentials_pkey on webauthn.credentials (id uuid_ops);
create unique index credentials_credential_id_key on webauthn.credentials (credential_id text_ops);
```

The registration and authentication flows both work by issuing a challenge to
the user, which is signed by the authenticator and returned back to the server
to be verified.

The `challenges` table will store each challenge used to register or
authenticate a passkey.

```sql
create table webauthn.challenges (
  id         uuid not null default gen_random_uuid(),
  user_id    uuid null default auth.uid(),
  value      text not null,
  created_at timestamptz not null default now(),
  constraint challenges_pkey primary key (id),
  constraint challenges_value_key unique (value),
  constraint challenges_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

create unique index challenges_pkey on webauthn.challenges (id uuid_ops);
create unique index challenges_value_key on webauthn.challenges (value text_ops);
```

The `user_id` column is nullable, because we will not know who the user is when
they are signing in.

## Configuration

The backend will require some configuration variables:

```ts
// src/webauthn/config.ts

const relyingPartyID = process.env.WEBAUTHN_RELYING_PARTY_ID
const relyingPartyName = process.env.WEBAUTHN_RELYING_PARTY_NAME
const relyingPartyOrigin = process.env.WEBAUTHN_RELYING_PARTY_ORIGIN

export { relyingPartyID, relyingPartyName, relyingPartyOrigin }
```

The Relying Party ID should be based on your host's domain name, without the
`https://` or port number. For example, `example.com` or `localhost`.

## Passkey registration overview

As passkeys are an opt-in experience, the first thing to implement is the
ability for an already signed-in user to create a new passkey for themselves.

At a high level, the passkey registration flow looks like this:

1. The client sends an API request to the server to generate a unique challenge
   and passkey creation options.
2. The client creates the passkey on the user's device using the retrieved
   creation options.
3. The client sends the authenticator attestation response to the server.
4. The server verifies the attestation response against the challenge that was
   generated earlier.
5. Upon successful verification, the server stores the new credential in the
   users account.

## Start the passkey registration flow

When the user clicks Create Passkey, the application will send a POST request to
the server to obtain the
[PublicKeyCredentialCreationOptions](https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialCreationOptions)
dictionary. This dictionary contains a crypographic challenge, which is
generated on the server.

We need to add a new route handler to the Next.js app. Since this is an
authenticated endpoint, we need to make sure the user is signed in:

```ts
// src/app/api/passkeys/challenge/route.ts

import { createClient } from '@/utils/supabase/server'

export async function POST() {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // ...
}
```

Now we can create the options dictionary using the
`generateRegistrationOptions()` function.

```ts
import { generateRegistrationOptions } from '@simplewebauthn/server'

const options = await generateRegistrationOptions({
  rpName: relyingPartyName,
  rpID: relyingPartyID,
  userName: user.email,
  userDisplayName: user.user_metadata.display_name,
  attestationType: 'none',
  authenticatorSelection: {
    residentKey: 'preferred',
    userVerification: 'preferred',
    authenticatorAttachment: 'platform'
  }
})
```

By default, SimpleWebAuthn generates it's own user IDs for privacy. I've opted
to use the existing ID from the `auth.users` table, as it is already a UUID and
doesn't contain any personally identifying information. You can read more about
how to use custom user IDs
[here](https://simplewebauthn.dev/docs/advanced/server/custom-user-ids).

```ts
import { isoUint8Array } from '@simplewebauthn/server/helpers'

const options = await generateRegistrationOptions({
  // ...
  userID: isoUint8Array.fromASCIIString(user.id)
})
```

While the `generateRegistrationOptions()` takes care of generating the
cryptographic challenge, we still have to save it so we can retrieve it later in
the verify route handler.

```ts
import { saveWebAuthnChallenge } from '@/webauthn/store'

const challenge = await saveWebAuthnChallenge({
  user_id: user.id,
  value: options.challenge
})
```

Finally, we return the options dictionary to the browser:

```ts
return NextResponse.json(options, { status: 200 })
```

We can improve this to prevent the user from re-registering the same credential
twice. All we have to do is pass any existing credentials in the
`excludeCredentials` property when calling `generateRegistrationOptions()`:

```ts
import { listWebAuthnCredentialsForUser } from '@/webauthn/store'

const credentials = await listWebAuthnCredentialsForUser(user.id)

const options = await generateRegistrationOptions({
  // ...
  excludeCredentials: credentials.map((credential) => ({
    id: credential.credential_id,
    type: credential.credential_type,
    transports: credential.transports
  }))
})
```

## Complete the passkey registration flow

Once the user has created a new passkey on their device, the browser will call
our verify endpoint to register the passkey.

The first thing to do is to retrieve the challenge that was created earlier.
Since the user is already authenticated during this flow, we can look the
challenge up by its `user_id` field:

```ts
// src/app/api/passkeys/verify/route.ts

import { getWebAuthnChallengeByUser } from '@/webauthn/store'

export async function POST(request: NextRequest) {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const challenge = await getWebAuthnChallengeByUser(user.id)

  // ...
}
```

Challenges should only be valid for one attempt in order to prevent replay
attacks. Once the challenged has been retrieved, immediately delete it from the
database regardless of whether it will be sucessfully verified or not:

```ts
import { deleteWebAuthnChallenge } from '@/webauthn/store'

await deleteWebAuthnChallenge(challenge.id)
```

Now we can call the `verifyRegistrationResponse()` function with the attestation
response received from the client and the expected challenge:

```ts
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { relyingPartyID, relyingPartyOrigin } from '@/webauthn/config'

const data = await request.json()
const verification = await verifyRegistrationResponse({
  response: data,
  expectedChallenge: challenge.value,
  expectedOrigin: relyingPartyOrigin,
  expectedRPID: relyingPartyID
})

const { verified } = verification
if (!verified) {
  return NextResponse.json(
    { error: 'Could not verify passkey' },
    { status: 401 }
  )
}
```

If the credential was verified successfully we can store it in our database:

```ts
import { saveWebAuthnCredential } from '@/webauthn/store'

const { registrationInfo } = verification

const values = {
  user_id: user.id,
  friendly_name: `Passkey created ${new Date().toLocaleString()}`,

  credential_type: registrationInfo.credentialType,
  credential_id: registrationInfo.credentialID,

  public_key: registrationInfo.credentialPublicKey,
  aaguid: registrationInfo.aaguid,
  sign_count: registrationInfo.counter,

  transports: data.response.transports ?? [],
  user_verification_status: registrationInfo.userVerified
    ? 'verified'
    : 'unverified',
  device_type:
    registrationInfo.credentialDeviceType === 'singleDevice'
      ? 'single_device'
      : 'multi_device',
  backup_state: registrationInfo.credentialBackedUp
    ? 'backed_up'
    : 'not_backed_up'
}

const savedCredential = await saveWebAuthnCredential(values)
```

Finally, we can return some data to the browser so it can update the user
interface of the Settings page.

```ts
const passkeyDisplayData = {
  credential_id: savedCredential.credential_id,
  friendly_name: savedCredential.friendly_name,

  credential_type: savedCredential.credential_type,
  device_type: savedCredential.device_type,
  backup_state: savedCredential.backup_state,

  created_at: savedCredential.created_at,
  updated_at: savedCredential.updated_at,
  last_used_at: savedCredential.last_used_at
}

return NextResponse.json(passkeyDisplayData, {
  status: 201,
  headers: {
    Location: `/api/passkeys/${savedCredential.id}`
  }
})
```

## The registration user interface

The Settings page contains a typical data table to show existing passkeys and a
Create Passkey button.

The page route is a server component that fetches whatever passkeys already
exist for the user and passes them to a client component:

```tsx
// src/app/dashboard/settings/security/page.tsx

import { createClient } from '@/supabase/server'
import { listWebAuthnCredentialsForUser } from '@/webauthn/store'
import { redirect } from 'next/navigation'
import { PasskeysSection } from './passkeys-section'

export default async function SecuritySettingsPage() {
  const supabase = createClient()
  const {
    data: { user }
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/signin')
  }

  const credentials = await listWebAuthnCredentialsForUser(user.id)
  const passkeys = credentials.map((credential) => ({
    credential_id: credential.credential_id,
    friendly_name: credential.friendly_name,
    credential_type: credential.credential_type,
    device_type: credential.device_type,
    backup_state: credential.backup_state,
    created_at: credential.created_at,
    updated_at: credential.updated_at,
    last_used_at: credential.last_used_at
  }))

  return <PasskeysSection initialPasskeys={passkeys} />
}
```

Define a client function to perform the end-to-end registration flow. Calling
this function will either return the new passkey if it's successful or throw an
error:

```ts
// app/webauthn/client.ts

import { startRegistration } from '@simplewebauthn/client'
import { sendPOSTRequest } from './helpers'

export async function createPasskey() {
  const options = await sendPOSTRequest('/api/passkeys/challenge')
  const credential = await startRegistration(options)
  const newPasskey = await sendPOSTRequest('/api/passkeys/verify', credential)
  if (!newPasskey) {
    throw new Error('No passkey returned from server')
  }
  return newPasskey
}
```

This function will be called from the `onClick` handler of the Create Passkey
button:

```tsx
// src/app/dashboard/settings/security/passkeys-section.tsx

import { useState } from 'react'
import { toast } from 'sonner'
import { createPasskey } from '@/webauthn/client'

export default function PasskeysSection({
  initialPasskeys
}: {
  initialPasskeys: {
    // ...
  }[]
}) {
  const [passkeys, setPasskeys] = useState(initialPasskeys)
  const [creating, setCreating] = useState(false) // controls loading indicator

  const handleCreatePasskey = async () => {
    try {
      setCreating(true)
      const passkey = await createPasskey()
      setPasskeys((prev) => [...prev, passkey])
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          // This request has been cancelled by the user.
          return
        }
        toast(error.message)
      }
    } finally {
      setCreating(false)
    }
  }
}
```

When the button is clicked, the created passkey is optimistically added to the
table's state.

If the user explicitly aborts the flow, a `NotAllowedError` error will be
thrown. The handler needs to explictly check for this case in order to avoid
showing an error message to the user.

That's it! Now a user can sign in and create their own passkeys.

## Passkey authentication overview

The flow for authenticating with a passkey is quite similar to the registration
flow. We'll need two endpoints to start and complete the flow, as well as some
client-side code to perform the flow.

At a high level, the passkey authentication flow looks like this:

1. The client sends an API request to the server to generate a unique challenge
   and passkey authentication options.
2. The client signs the challenge on the user's device using their passkey.
3. The client sends the authenticator assertion response to the server.
4. The server verifies the assertion response against the challenge that was
   generated earlier.
5. Upon successful verification, the server generates an access token for the
   user.

The main difference is that the user will not be authenticated in the endpoint
handlers. The verify endpoint will need to determine who the user is by looking
them up from the matched credential.

This presents a major issue: how do you associate the cryptographic challenge
with the user if you don't know who they are yet? Most passkey tutorials that I
could find on the web assume that your web framework provides some sort of
mutable `session` object, which you can attach the challenge to. There is no
such session object in Next.js app directory route handlers, so I opted to
implement a simple cookie-based session.

## Start the passkey authentication flow

I initially allowed users to sign in with a passkey by adding a Sign In with
Passkey button to the sign-in page. When the user clicks this button the
application will send a POST request to the server to obtain the
[PublicKeyCredentialRequestOptions](https://developer.mozilla.org/en-US/docs/Web/API/PublicKeyCredentialRequestOptions)
dictionary.

The route handler will be roughly the same as the start registration route
handler. Since the user will not be authenticated, so there is no need to
validate the supabase user:

```ts
// src/app/auth/passkey/route.ts

import { generateAuthenticationOptions } from '@simplewebauthn/server'
import { relyingPartyID } from '@webauthn/config'
import { saveWebAuthnChallenge } from '@webauthn/store'

export async function POST() {
  const options = await generateAuthenticationOptions({
    rpID: relyingPartyID
  })

  const challenge = await saveWebAuthnChallenge({
    value: options.challenge
  })

  // Store the challenge ID in the "session"
  cookies().set('webauthn_state', challenge.id, {
    httpOnly: true,
    sameSite: true,
    secure: !process.env.LOCAL
  })

  return NextResponse.json(options, { status: 200 })
}
```

## Complete the passkey authentication flow

The verify router handler is also similar to its registration counterpart.

First retrieve the challenge using its ID stored in the "session".

```ts
// src/app/auth/verify/route.ts

import { getWebAuthnChallenge } from '@/webauth/store'

export async function POST(request: NextRequest) {
  const challengeID = cookies().get('webauthn_state')?.value
  const challenge = await getWebAuthnChallenge(challengeID)
}
```

Again, we should delete the challenge immediately to prevent replay attacks.

```ts
import { removeWebAuthnChallenge } from '@/webauth/store'

await removeWebAuthnChallenge(challengeID)
```

Next, we can retrieve the credential that was alledgedly used. I say alledgedly
because we haven't verified anything yet.

The request body will contain an `id` field which will correspond to the
`credential_id` field of the credential. Be careful! Here the `credential_id`
field is the one set by the authenticator, which is different to our internal
primary key.

```ts
import { getWebAuthnCredentialByCredentialID } from '@/webauth/store'

const data = await request.json()
const credential = await getWebAuthnCredentialByCredentialID(data.id)
if (!credential) {
  return NextResponse.json(
    { error: 'Could not sign in with passkey' },
    { status: 401 }
  )
}
```

With the expected credential in hand, we can verify the authentication response,
and return the result to the browser.

```ts
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { relyingPartyID, relyingPartyOrigin } from '@/webauthn/config'

const verification = await verifyAuthenticationResponse({
  response: data,
  expectedChallenge: challenge.value,
  expectedOrigin: relyingPartyOrigin,
  expectedRPID: relyingPartyID,
  authenticator: {
    credentialID: credential.credential_id,
    credentialPublicKey: credential.public_key,
    counter: credential.sign_count,
    transports: credential.transports
  }
})

const { verified } = verification
```

Before we return the result to the browser, there is some housekeeping we need
to do. Namely, we need to update the `sign_count` and `last_used_at` fields on
the credential record in the database:

```ts
import { sql } from 'drizzle-orm'

if (verified) {
  await updateWebAuthnCredentialByCredentialID(credential.credential_id, {
    sign_count: verification.authenticationInfo.newCounter,
    last_used_at: sql`now()`
  })
}
```

## The authentication user interface

Define a client function to perform the end-to-end authentication flow. Calling
this function will either return a successful result or throw an error:

```ts
// app/webauthn/client.ts

import { sendPOSTRequest } from './helpers'
import { startAuthentication } from '@simplewebauthn/client'

export async function signInWithPasskey(
  useBrowserAutofill?: boolean = false
): Promise<void> {
  const options = await sendPOSTRequest('/auth/passkey')
  const authenticationResponse = await startAuthentication(
    options,
    useBrowserAutofill
  )
  const { verified } = await sendPOSTRequest(
    '/auth/verify',
    authenticationResponse
  )
  if (!verified) {
    throw new Error('Could not sign in with passkey')
  }
  return { verified }
}
```

This function sould be called from the `onClick` handler of the Sign In with
Passkey button.

## Issue an access token to the user

Currently a user can create and use their own passkey. But nothing happens when
they sign in. That's because we still need to create a new user session.

In order for a user to sign in to Supabase and access data using Row Level
Security, we need to issue our own JWT to the user. Fortunately, Supabase
supports this use case and provides the same JWT signing secret that they use
within the dashboard.

In our application we'll define two new environment variables in order to issue
our own JWTs:

```sh
SUPABASE_AUTH_JWT_SECRET=secret_copied_from_supabase_dashboard
SUPABASE_AUTH_JWT_ISSUER=https://exampleapp.com/webauthn
```

Now we can create a function to build a JWT payload and sign it using our
secret:

```ts
// src/webauthn/session.ts

import { User } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const jwtSecret = process.env.SUPABASE_AUTH_JWT_SECRET
const jwtIssuer = process.env.SUPABASE_AUTH_JWT_ISSUER

export function createWebAuthnAccessTokenForUser(user: User) {
  const issuedAt = Math.floor(Date.now() / 1000)
  const expirationTime = issuedAt + 3600 // 1 hour expiry
  const payload = {
    iss: jwtIssuer,
    sub: user.id,
    aud: 'authenticated',
    exp: expirationTime,
    iat: issuedAt,

    email: user.email,
    phone: user.phone,
    app_metadata: user.app_metadata,
    user_metadata: user.user_metadata,
    role: 'authenticated',
    is_anonymous: false
  }

  return jwt.sign(payload, jwtSecret, {
    algorithm: 'HS256',
    header: {
      alg: 'HS256',
      typ: 'JWT'
    }
  })
}
```

We can deliver this access token to the user agent by calling `setSession()` on
the supabase client. This will take care of storing it in the appropriate cookie
in the user's browser:

```ts
// src/webauthn/session.ts

import { createClient } from '@/supabase/server'

export async function createWebAuthnSessionforUser(user: User) {
  const accessToken = createWebAuthnAccessTokenForUser(user)

  const supabase = createClient()
  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: '' // dummy value
  })
  if (error) {
    throw error
  }
}
```

The advantage of calling `setSession()` is that it will store the custom access
token the same was that Supabase-issued tokens are stored. This should mean that
Supabase clients will work transparently.

A major downside of storing the access token this way is that Supabase clients
will not be able to refresh them, as they do not actually correspond to any
session in the `auth.sessions` table.

A possible enhancement would be to define our own `sessions` and
`refresh_tokens` tables within the `webauthn` schema, mirroring those in the
`auth` schema. Then when we initialise the Supabase client, we could supply a
custom `accessToken()` function that will take care of refreshing the session
for us.

## Automatically suggest a passkey friendly name

We can make the experience of creating a new passkey a bit nicer by
automatically suggesting a friendly name instead of "Passkey created {date}".

To do this we'll make use of the Authenticator Attestation GUID, which is
contained in the `aaguid` field of the attestation object. This value describes
the make and model of the authenticator used to create the passkey. For example,
"iCloud Keychain".

The FIDO alliance maintains a list of metadata statements for known
authenticators. We can use the SimpleWebAuthn library to conveniently look up a
metadata statement by AAGUID.

Unfortunately, when I was testing this on my MacBook, the statement
corresponding to iCloud Keychain was not included. For this we have to go to a
community supported database at
https://github.com/passkeydeveloper/passkey-authenticator-aaguids.

Altogether, our function for retrieving a default friendly name given an AAGUID
looks like this:

```ts
// src/webauthn/metadata.ts

import { MetadataService } from '@simplewebauthn/server'
import additionalMetadata from './additional-aaguids.json'

MetadataService.initialize({ verificationMode: 'permissive' }).then(() => {
  console.log('MetadataService initialized')
})

export async function authenticatorDescriptionWithAAGUID(aaguid: string) {
  const statement = await MetadataService.getStatement(aaguid)
  if (statement) {
    return statement.description
  }
  return (additionalMetadata as Record<string, { name: string }>)[aaguid].name
}
```

Now when registering a new passkey, we can provide a better default friendly
name:

```ts
// src/api/passkeys/verify/route.ts

const { registrationInfo } = verification

const description = await
authenticatorDescriptionWithAAGUID(registrationInfo.aaguid)

const friendly_name =
  description ?? `Passkey created ${new Date().toLocaleString()}`
```

## Sign in with Passkey via browser autofill

Another user experience enhancement is to implement
[Conditional UI](https://github.com/w3c/webauthn/wiki/Explainer:-WebAuthn-Conditional-UI).

This lets us remove the Sign in with Passkey button from the sign-in page and
replace it with an autofill prompt that appears when the user focuses the
username input.

Adopting Conditional UI with the SimpleWebAuthn library is a matter of passing
`true` for the the `useBrowserAutofill` argument of the `startAuthentication()`
function.

```ts
// Conditional UI
useEffect(() => {
  let cancelled = false
  setTimeout(() => {
    if (cancelled) {
      return
    }
    signInWithPasskey(email, true /* useBrowserAutofill */)
      .then(() => {
        router.push('/dashboard')
      })
      .catch((error) => {
        if (error instanceof Error) {
          if (error.name === 'NotAllowedError') {
            return
          }
          console.error(error)
          toast(error.message)
        }
      })
  }, 0)
  return () => {
    cancelled = true
  }
}, [])
```

> Warning: React Strict Mode is enabled during development, which causes all
> effects to be run twice. I found that calling `navigator.credentials.get()`
> twice on Safari caused the macOS Sign In dialog to become undismissable. To
> work around this I wrapped the entire effect inside a timeout and only proceed
> if the effect was not cleaned up.

## Summary

It's entirely possible to implement passkeys in a Supabase app. The
SimpleWebAuthn library makes it incredibly easy to implement the specification.
Most of the implementation is just wiring it up.

I chose to add passkey registration to the Settings page. A better experience
would be to present an interstitial to the user immediately after they sign in
with a password. The user should also be to able to enter their own friendly
name in order to recognise the passkey later.

Because the application session is implemented using a custom access token,
Supabase cannot automatically refresh it. The next step would be to generate a
refresh token along with the access token and implement session autorefresh.
That is outside the scope of this article though!
