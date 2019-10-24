#!/bin/bash

package_name=$(node -p "require('./package.json').name")
package_ver=$(node -p "require('./package.json').version")

echo "Assumed unreleased package version: v${package_ver}"
echo ""

view_out=$(npm view @aem-design/compose-webpack@"${package_ver}")
view_out_length=${#view_out}

# If the 'view_out_length' is zero, it means the defined version hasn't been published
# yet to the registry.
if [[ $view_out_length == 0 ]]; then
  echo "Release doesn't exist yet, publishing to GPR..."
  echo ""

  echo "Pack ${package_name} to ensure it will deploy correctly."
  npm pack --dry-run

  echo ""

  pack_status=$?
  if [[ $pack_status != 0 ]]; then
    echo "Unable to verify package for ${package_name}, 'npm pack' was not successful!"
    exit 1
  fi
else
  echo "Release already found in the registry, automatic publishing cannot be completed for v${package_ver}"
  exit 1
fi

exit 0