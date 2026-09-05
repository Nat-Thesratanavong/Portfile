#!/bin/sh
# Installs the local pre-commit secret scan.
# Requires the gitleaks binary on PATH: https://github.com/gitleaks/gitleaks/releases
# Run: npm run hooks:install
set -e
HOOK=".git/hooks/pre-commit"
cat > "$HOOK" <<'EOF'
#!/bin/sh
if ! command -v gitleaks >/dev/null 2>&1; then
  echo "warning: gitleaks not installed; skipping secret scan" >&2
  exit 0
fi
exec gitleaks protect --staged --config .gitleaks.toml --verbose --redact
EOF
chmod +x "$HOOK"
echo "pre-commit secret scan installed"
