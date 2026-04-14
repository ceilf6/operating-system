for file in "$(pwd)"/test-files/*
do
    # 如果不是普通文件就跳过，因为会损坏文件
    [ -f "$file" ] || continue

    set -- $(ls -l "$file")
    lastTime="$6 $7 $8"
    
    tmpFile="/tmp/fichtemp.$$"
    echo $lastTime > "$tmpFile"
    cat "$file" >> "$tmpFile"
    mv "$tmpFile" "$file"
done
