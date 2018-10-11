#/bin/bash
# grep web3 package.json 
# grep web3 package.json | awk 'BEGIN { FS = "[\":,-]" } ; {print "1=", $1, "2=", $2, "3=",  $3, "4=", $4, "5=",  $5, "6=", $6}'
WEB3_VER=`grep web3 package.json | awk 'BEGIN { FS = "[\":,-]" } ; {print $6}'`
echo $WEB3_VER
if [ "$WEB3_VER"=="beta.34" ]; then
    echo "applying web3 typescript compatability workaround"
    sed -i '' 's/bn\.js/bignumber\.js/' node_modules/web3/types.d.ts 
fi


