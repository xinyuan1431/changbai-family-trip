# Changbai family trip project

## Source versioning

The user requested GitHub backups of website appearance and functionality versions only. Repository: https://github.com/xinyuan1431/changbai-family-trip (private). Named remote: github. Main branch: main.

After each completed source change, preserve existing history, commit with a meaningful message, and push the current intended main-branch changes to github. Do not force-push. After a successful production deployment, tag the exact deployed source commit with the next unused semantic version and push that tag. Record the release in VERSIONING.md. Do not mark failed deployments as released. GitHub push does not deploy Sites automatically; use the Sites workflow separately.

Never commit runtime credentials, .dev.vars, real .env files, the editor password file, local database files, or cache artifacts. Keep the repository private unless the user explicitly requests otherwise.

A source rollback must preserve cloud trip data, expenses, tasks, runtime secrets, and already-applied database migrations. Check schema compatibility before restoring older application code. Prefer an additive restore commit or isolated checkout, and retain uncommitted user work.

See VERSIONING.md for the baseline release and restoration process.
