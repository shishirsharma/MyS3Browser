'use strict';

var renderer = document.getElementById('theFrame').contentWindow;

var message = {
    command: 'render',
    context: {thing: 'world'},
    name: 'hello'
};

var s3 = ''
var prefix = ''

renderer.postMessage(message, '*');

window.addEventListener('message', function(event) {
    if (event.data.html) {
        new Notification('Templated!', {
            icon: 'icon.png',
            body: 'HTML Received for "' + event.data.name + '": `' +
                event.data.html + '`'
        });
    }
});


function listBuckets(s3, s3Bucket) {
    if (window.console) { console.log("Done"); }
    s3.listBuckets(function(err, buckets) {
        if (err) {
            if (window.console) { console.log(err, err.stack); } // an error occurred
        } else {
            if (window.console) { console.log(buckets); }           // successful response
            var select = $('#buckets-select').empty();

            $.each(buckets.Buckets, function(i, bucket) {
                var option = document.createElement('option');
                option.text = bucket.Name;
                if (s3Bucket === "") { s3Bucket = bucket.Name}
                if (s3Bucket === bucket.Name) { $(option).attr('selected', true); }
                select.append(option);
            });

            select.change(function() {
                var s3Bucket = select.val();
                if (window.console) { console.log(s3Bucket); }           // successful response
                chrome.storage.local.set({'s3-bucket': s3Bucket}, function() {
                    if (window.console) { console.log('[chrome.storage] s3-bucket updated'); }
                });
                var s3Region = '';

                var p1 = new Promise(function(resolve, reject) {
                    var params = {
                        Bucket: s3Bucket /* required */
                    };
                    s3.getBucketLocation(params, function(err, data) {
                        if (err) {
                            if (window.console) { console.log(err, err.stack); } // an error occurred
                        } else {
                            s3Region = data.LocationConstraint;
                            if(window.console) { console.log(data); }            // successful response
                            resolve(true);
                        }
                    });
                });
                var p2 = p1.then(function(val) {
                    return new Promise(function(resolve, reject) {
                        AWS.config.region = s3Region;
                        s3 = new AWS.S3();

                        listObjects(s3, s3Bucket, '');
                    });
                });
            });
        }
    });
}

function listObjects(s3, s3Bucket, s3_prefix, s3_marker='') {
    if (window.console) { console.log("s3://", s3Bucket, "/",  prefix, s3.endpoint.hostname); }
    var prefix = s3_prefix;
    var marker = s3_marker;
    var params = {
        Bucket: s3Bucket,
        Delimiter: '/',
        Prefix: decodeURIComponent(prefix),
        Marker: marker,
        EncodingType: 'url'
//        MaxKeys: 
    };
    if (window.console) { console.log(prefix, marker); }           // successful response

    s3.listObjects(params, function(err, files) {
        if (err) {
            // an error occurred
            if (window.console) { console.log(err, err.stack); }
        }
        else {
            if (window.console) { console.log(files); }           // successful response

            // successful response
            $('#fileTable').empty();
            var tr = $('<tr>');
            $.each(['Key', 'Last Updated', 'Size'], function(i, header){
                tr.append(
                    $('<th>').text(header)
                );
            });
            $('<thead>').append(tr).appendTo('#fileTable');
            var tbody = $(document.createElement('tbody'));
            $.each(files.CommonPrefixes, function(i, folder) {
                var a = document.createElement('a');
                var strong = document.createElement('strong');
                strong.textContent = decodeURIComponent(folder.Prefix.replace(prefix, ''))
                $('<tr>').attr(
                    'id', i
                ).append(
                    $('<td>').attr(
                        'id', 'folder_'+i
                    ).append(
                        '<span class="glyphicon glyphicon-folder-close" aria-hidden="true"></span> '
                    ).append(
                        $(a).attr(
                            'class', 's3-folder'
                        ).attr(
                            'data-prefix', folder.Prefix
                        ).attr(
                            'href','#'
                        ).append(
                            strong
                        )
                    )
                ).append(
                    $('<td>').text('')
                ).append(
                    $('<td>').text('')
                ).appendTo(tbody);
            });
            $.each(files.Contents, function(i, file) {
                var a = document.createElement('a');
                $('<tr>').attr(
                    'id', i
                ).append(
                    $('<td>').html(
                        $(a).attr(
                            'href', s3.getSignedUrl('getObject', {Bucket: s3Bucket, Key: decodeURIComponent(file.Key.replace('+', ' '))})
                        ).text(decodeURIComponent(file.Key.replace('+', ' ').replace(prefix, '')))
                    )
                ).append(
                    $('<td>').html(file.LastModified)
                ).append(
                    $('<td>').html(file.Size)
                ).appendTo(tbody);
            });
            if(files.IsTruncated) {
                var a = document.createElement('a');
                var strong = document.createElement('strong');
                strong.textContent = 'next'
                $('<tr>').attr(
                    'id', 'next'
                ).append(
                    $('<td>').attr(
                        'id', 'next'
                    ).append(
                        '<span class="glyphicon glyphicon-folder-close" aria-hidden="true"></span> '
                    ).append(
                        $(a).attr(
                            'class', 's3-folder'
                        ).attr(
                            'data-prefix', prefix
                        ).attr(
                            'data-marker', files.NextMarker
                        ).attr(
                            'href','#'
                        ).append(
                            strong
                        )
                    )
                ).append(
                    $('<td>').text('')
                ).append(
                    $('<td>').text('')
                ).appendTo(tbody);
            }
            tbody.appendTo('#fileTable');

            var tags = prefix.trim().split('/');
            tags.pop(); // Remove empty element due to last comma

            if (window.console) { console.log('[listObjects] [tags] values: ' + tags); }
            if (window.console) { console.log('[listObjects] [tags] length: ' + tags.length); }

            $('#prefix-breadcrumb').empty();
            var li = document.createElement('li');
            var a = document.createElement('a');

            if (tags.length >= 1) {
                $('#prefix-breadcrumb').append(
                    $(li).append(
                        $(a).attr('class', 's3-folder').attr('data-prefix', '').attr('href', '#').text(decodeURIComponent('s3://' + s3Bucket))
                    )
                );

                var len = tags.length;
                $.each(tags, function(i, elem){
                    var a = document.createElement('a');
                    li = document.createElement('li');
                    if (i === (len - 1)) {
                        if (window.console) { console.log('[listObjects] [loop] last ' + i); }

                        $('#prefix-breadcrumb').append(
                            $(li).attr('class', 'active').text(decodeURIComponent(elem))
                        );
                    } else {
                        if (window.console) { console.log('[listObjects] [loop] ' + i); }

                        $('#prefix-breadcrumb').append(
                            $(li).append(
                                $(a).attr(
                                    'class', 's3-folder'
                                ).attr(
                                    'data-prefix', tags.slice(0,i+1).join('/')+'/'
                                ).attr(
                                    'href', '#'
                                ).text(decodeURIComponent(elem))
                            )
                        );
                    }
                });
            } else {
                $('#prefix-breadcrumb').append(
                    $(li).attr('class', 'active').text(decodeURIComponent('s3://' + s3Bucket))
                );
            }

            $('a.s3-folder').click(function () {
                var prefix = $(this).attr('data-prefix');
                var marker = $(this).attr('data-marker');
                listObjects(s3, s3Bucket, prefix, marker);
            });
        }
    });
}




function main() {
    var accessKeyId = ''
    var secretAccessKey = ''
    var s3Region = '';
    var s3Bucket = '';

    // var s3 = '';

    var p1 = new Promise(function(resolve, reject) {
        chrome.storage.local.get('access-key-id', function(result) {
            accessKeyId = result['access-key-id'];
            $('#access-key-id')[0].value = accessKeyId;
            if (window.console) { console.log('[chrome.storage] [read] ' + JSON.stringify(result)); }
            resolve(true);
        });
    });
    var p2 = p1.then(function(val) {
        return new Promise(function(resolve, reject) {
            chrome.storage.local.get('secret-access-key', function(result) {
                secretAccessKey = result['secret-access-key'];
                $('#secret-access-key')[0].value = secretAccessKey;
                if (window.console) { console.log('[chrome.storage] [read] ' + JSON.stringify(result)); }
                resolve(true);
            });
        });
    })
    var p3 = p2.then(function(val) {
        return new Promise(function(resolve, reject) {
            chrome.storage.local.get('s3-region', function(result) {
                s3Region = result['s3-region'];
                $('#s3-region')[0].value = result['s3-region'];
                if (window.console) { console.log('[chrome.storage] [read] ' + JSON.stringify(result)); }
                resolve(true);
            });
        });
    });
    var p4 = p3.then(function(val) {
        return new Promise(function(resolve, reject) {
            chrome.storage.local.get('s3-bucket', function(result) {
                s3Bucket = result['s3-bucket'];
                $('#s3-bucket')[0].value = s3Bucket;
                if (window.console) { console.log('[chrome.storage] [read] ' + JSON.stringify(result)); }
                resolve(true);
            });
        });
    });
    var p5 = p4.then(function(val) {
        return new Promise(function(resolve, reject) {
            AWS.config.update({
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey
            });
            AWS.config.region = s3Region;

            s3 = new AWS.S3();
            resolve(true);
        });
    });

    var p6 = p5.then(function(val) {
        return new Promise(function(resolve, reject) {
            var params = {
                Bucket: s3Bucket /* required */
            };
            s3.getBucketLocation(params, function(err, data) {
                if (err) {
                    if (window.console) { console.log(err, err.stack); } // an error occurred
                } else {
                    s3Region = data.LocationConstraint;
                    chrome.storage.local.set({'s3-region': s3Region}, function() {
                        if (window.console) { console.log('[chrome.storage] s3-region updated'); }
                    });
                    AWS.config.region = s3Region;
                    s3 = new AWS.S3();
                    resolve(true);
                }
            });
        });
    });

    p6.then(function(val) {
        return new Promise(function(resolve, reject) {
            listBuckets(s3, s3Bucket);
            listObjects(s3, s3Bucket, '');
            resolve(true);
        });
    });

}

function setup() {
    $('#btnSaveChange').click(function() {
        if (window.console) { console.log('attampting chrome.storage data updation'); }
        var accessKeyId = $('#access-key-id')[0].value;
        chrome.storage.local.set({'access-key-id': accessKeyId}, function() {
            if (window.console) { console.log('[chrome.storage] access-key-id updated'); }
        });
        var secretAccessKey = $('#secret-access-key')[0].value;
        chrome.storage.local.set({'secret-access-key': secretAccessKey}, function() {
            if (window.console) { console.log('[chrome.storage] secret-access-key updated'); }
        });
        var s3Region = $('#s3-region')[0].value;
        chrome.storage.local.set({'s3-region': s3Region}, function() {
            if (window.console) { console.log('[chrome.storage] s3-region updated'); }
        });
        var s3Bucket = $('#s3-bucket')[0].value;
        chrome.storage.local.set({'s3-bucket': s3Bucket}, function() {
            if (window.console) { console.log('[chrome.storage] s3-bucket updated'); }
        });
        chrome.storage.local.set({'first_run': false}, function() {
            if (window.console) { console.log('[chrome.storage] set first_run'); }
        });
        main();
        return true;
    });
    $('#btnUpload').click(function() {
        var fileChooser = $('#file-chooser')[0];
        var awsKey = $('#aws-key')[0].value;
        
        if (window.console) { console.log('awsKey :', awsKey, ' prefix : ', prefix); }
        if (window.console) { console.log('getting file object'); }

        var file = prefix + fileChooser.files[0];
        if (file) {
            if (window.console) { console.log('prepare params'); }
            var params = {
                Key: awsKey,
                ContentType: file.type,
                Body: file,
                Bucket: s3Bucket
            };
            if (window.console) { console.log('Started upload'); }
            s3.upload(params, function(err, data) {
                if (window.console) { console.log(err ? 'ERROR!' : 'UPLOADED.'); }
                if (window.console) { console.log('Finished upload' + data); }
            });
        } else {
            if (window.console) { console.log('nothing to upload'); }
        }
    });
    
}

document.addEventListener('DOMContentLoaded', function () {
    setup();
    var p1 = new Promise(function(resolve, reject) {
        chrome.storage.local.get('first_run', function(result) {
            var first_run = result['first_run'];
            if (window.console) { console.log('[chrome.storage] get first_run ', first_run); }
            if (first_run) {
                reject(true)
            } else {
                resolve(true);
            }
        });
    });
    var p2 = p1.then(function(val) {
        main();
    }).catch(function(reason) {
        $('#credentialModal').modal('show')        
    });
});



