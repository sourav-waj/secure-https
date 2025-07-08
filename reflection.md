## Authentication Method Choice

I chose JWT tokens because they're what we learned in class and they work well with HTTPS. They're simpler than sessions for a small project like this. The only downside is that stolen tokens can't be cancelled until they expire after 1 hour, but that's okay for this assignment.

## Access Control System

I set up two basic roles: 'student' for regular users and 'admin' for special access. At first I forgot to protect the admin page properly, but then I added the isAdmin middleware check. It took me a couple tries to get the role checking working right. I kept it simple because we only needed these two permission levels.

## Token Storage and Management

I stored tokens in memory since we aren't using databases yet. I made tokens expire after 1 hour - not too short to annoy users, but not too long to be unsafe. For a real application, I'd need a better system to handle stolen tokens, but this works fine for our class project.

## Security Risks and Solutions

The main risks I thought about were brute force attacks and token theft. I added rate limiting to block after 5 failed logins and used HTTPS to protect the connection. I also made error messages generic so hackers wouldn't get extra information. The hardest part was testing all the different cases where things might go wrong.

