#!/bin/bash

# Script to add default exports to all lazy-loaded components

FILES=(
  "RealMoneyDashboard"
  "DepositPage"
  "MemberDepositPage"
  "AuthDiagnosticTool"
  "QuickCreateMember"
  "TestAccountCreator"
  "SimpleAccountCreator"
  "QuickLoginTest"
  "BackendTest"
  "ComprehensiveTest"
  "DebugPage"
  "TestChart"
  "SupabaseTestPage"
  "QuickFixDashboard"
  "DeploymentGuide"
  "ManualDeploymentHelper"
)

for file in "${FILES[@]}"; do
  filepath="src/app/components/${file}.tsx"
  
  # Check if file already has default export
  if grep -q "export default ${file}" "$filepath"; then
    echo "✅ $file already has default export"
  else
    echo "" >> "$filepath"
    echo "// ✅ Default export for lazy loading" >> "$filepath"
    echo "export default ${file};" >> "$filepath"
    echo "✅ Added default export to $file"
  fi
done

echo ""
echo "✅ All files updated!"
