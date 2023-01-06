#!/bin/bash


CONTRACT_LOCATION=./src/contracts/demo.ts
CONTRACT_NAME="Demo"

echo "About to run contract $CONTRACT_NAME defined in $CONTRACT_LOCATION"

read -p "Do you want to run local tests or deploy to testnet? [local/testnet] (Default: local): " test_type
test_type=${test_type:-local}

while [[ "${test_type}" != "local" && "${test_type}" != "testnet" ]] ; do
    read -p "Invalid option. [local/testnet] (Default: local): " test_type
    test_type=${test_type:-local}
done

if [ "${test_type}" == "local" ] ; then
    npm run test
elif [ "${PROCEED}" != "y" ] ; then
    npm run testnet
    while [ "$?" == "255" ] ; do
        read -p "Proceed?"
        npm run testnet-nobuild
    done
fi
