#!./bin/bash

find . -type d -print0 | while read -d '' -r dir; do

    files=$(find $dir -type f | wc -l)


    if (( files > 2 ))
    then
        printf "$files files in directory %s\n" "${#files[@]}" "$dir"
    fi

done