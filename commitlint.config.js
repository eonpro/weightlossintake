// =============================================================================
// COMMITLINT CONFIGURATION
// =============================================================================
// Enforces conventional commit format:
//   type(scope): subject
//
// Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build, revert
//
// Examples:
//   feat(intake): add BMI calculation step
//   fix(api): handle rate limit edge case
//   docs: update SECURITY.md with new env vars
// =============================================================================

module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only
        'style',    // Formatting, missing semicolons, etc.
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'test',     // Adding missing tests
        'chore',    // Maintenance tasks
        'perf',     // Performance improvement
        'ci',       // CI/CD configuration
        'build',    // Build system or dependencies
        'revert',   // Revert previous commit
      ],
    ],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 100],
    'body-max-line-length': [2, 'always', 200],
  },
};
