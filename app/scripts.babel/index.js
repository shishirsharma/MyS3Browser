'use strict';

var s3 = '';
var prefix = '';
var state = {};
var renderer = {};

function humanFileSize(bytes, si) {
    var thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
        ? ['KB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}

function listBuckets(s3, s3Bucket, callback) {
    if (window.console) { console.log('[function.listBuckets]', 'starting'); }
    s3.listBuckets(function(err, buckets) {
        if (err) {
            if (window.console) { console.log(err, err.stack); } // an error occurred
            // Make sure the callback is a function
            if (typeof callback === 'function') {
                // Call it, since we have confirmed it is callable
                callback(err=true);
            }

        } else {
            if (window.console) { console.log('[function.listBuckets]', 'Buckets', buckets.Buckets.length); }
            // successful response
            var select = $('#buckets-select').empty();

            $.each(buckets.Buckets, function(i, bucket) {
                var option = document.createElement('option');
                option.text = bucket.Name;
                if (s3Bucket === '') {
                    s3Bucket = bucket.Name;
                    // chrome.storage.local.set({'s3-bucket': bucket.Name }, function() {
                    //     if (window.console) { console.log('[chrome.storage]', 's3-bucket updated'); }
                    // });
                }
                if (s3Bucket === bucket.Name) { $(option).attr('selected', true); }
                select.append(option);
            });

            // Make sure the callback is a function
            if (typeof callback === 'function') {
                // Call it, since we have confirmed it is callable
                callback(err=false);
            }

            select.change(function() {
                var s3Bucket = select.val();
                if (window.console) { console.log(s3Bucket); }           // successful response
                chrome.storage.local.set({'s3-bucket': s3Bucket}, function() {
                    if (window.console) { console.log('[chrome.storage]', 's3-bucket updated'); }
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
                            if (window.console) { console.log('[function.listBuckets]', 's3-region updated'); } // successful response
                            resolve(true);
                        }
                    });
                });
                var p2 = p1.then(function(val) {
                    return new Promise(function(resolve, reject) {
                        AWS.config.region = s3Region;
                        s3 = new AWS.S3();
                        if(window.console)  { console.log('[function.listBuckets]', 'listObjects', s3Bucket); }
                        listObjects(s3, s3Bucket, '');
                    });
                });
            });
        }
    });
}

function listObjects(s3, s3_bucket, s3_prefix, s3_marker='', callback) {
    var prefix = s3_prefix;
    var s3Bucket = s3_bucket;
    if(s3_bucket == '') {
        s3Bucket = $('#buckets-select').val();
    }
    var search_prefix = '';
    var marker = s3_marker;
    var params = {
        Bucket: s3Bucket,
        Delimiter: '/',
        Prefix: decodeURIComponent(prefix),
        Marker: marker,
        EncodingType: 'url',
        MaxKeys: 30
    };
    if (window.console) { console.log('[function.listObjects]', 's3://' + s3Bucket +  '.' + s3.endpoint.hostname + '/' + prefix + '#' + marker ); }
    state = {s3Bucket: s3Bucket, prefix: prefix, marker: marker };
    var tags = prefix.trim().split('/');
    search_prefix = tags.pop(); // Remove empty element due to last slash

    s3.listObjects(params, function(err, files) {
        if (err) {
            // an error occurred
            if (window.console) { console.log(err, err.stack); }
            // Make sure the callback is a function
            if (typeof callback === 'function') {
                // Call it, since we have confirmed it is callable
                callback(err=true);
            }
        }
        else {
            // successful response
            if (window.console) { console.log('[function.listObjects]', 'Folders:', files.CommonPrefixes.length, 'Files:', files.Contents.length); }


            var folders_context = files.CommonPrefixes.map(function(obj) {
                var map = {};
                map['prefix'] = obj.Prefix;
                map['name'] = obj.Prefix.replace(prefix, '');
                return map;
            });
            var files_context = files.Contents.map(function(obj) {
                var map = {};
                map['filename'] = decodeURIComponent(search_prefix+obj.Key.replace('+', ' ').replace(prefix, ''));
                map['href'] = s3.getSignedUrl('getObject', {Bucket: s3Bucket, Key: decodeURIComponent(obj.Key.replace('+', ' '))});
                map['prefix'] = obj.Prefix;
                map['LastModified'] = obj.LastModified;
                map['size'] = humanFileSize(obj.Size, true);
                return map;
            });
            var isTruncated = false;
            if (files.IsTruncated) {
                isTruncated = {marker: files.NextMarker};
            }
            renderer.postMessage({
                command: 'render', context: {
                    folders: folders_context, files: files_context, isTruncated: isTruncated
                }, name: 'main-table'
            }, '*');

            if (window.console) { console.log('[listObjects] [tags] values: ' + tags); }
            if (window.console) { console.log('[listObjects] [tags] length: ' + tags.length); }


            var crumbs = [];
            if (tags.length > 1) {
                tags.forEach(function(currentValue, index, array) {
                    crumbs.push({
                        prefix: decodeURIComponent('s3://' + s3Bucket) + '/' + array.slice(0,index+1).join('/')+'/',
                        name: currentValue
                    });
                });
                crumbs.pop();
            }

            renderer.postMessage({
                command: 'render',
                context: {
                    root: 's3://' + s3Bucket,
                    crumbs: crumbs,
                    active: tags.pop()
                },
                name: 'top-breadcrumb'
            }, '*');

            // Make sure the callback is a function
            if (typeof callback === 'function') {
                // Call it, since we have confirmed it is callable
                callback(err=false);
            }

        }

    });
}


function main() {
    var accessKeyId = '';
    var secretAccessKey = '';
    var s3Region = '';
    var s3Bucket = '';
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
    });
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
    var p7 = p6.then(function(val) {
        return new Promise(function(resolve, reject) {
            listBuckets(s3, s3Bucket, function(err) {
                if (window.console) { console.log('[main] listBuckets called'); }
                if (!err) {

                    resolve(true);
                }
            });
        });
    });
    p7.then(function(val) {
        return new Promise(function(resolve, reject) {
            listObjects(s3, s3Bucket, '', '', function(err) {
                if (window.console) { console.log('[main] listObjects called'); }
                if (!err) {
                    resolve(true);
                }
            });
        });
    });

}

function aws_prefix_search() {
    var search_query = $('#buckets-search-query').val();
    var tags = state.prefix.split('/');
    tags.pop();
    var search_prefix = listObjects(s3, state.s3Bucket, tags.join('/') + '/' + search_query);
    window.history.pushState(state, state.prefix+':'+state.marker);
}

function setup() {
    $('#btnSaveChange').click(function() {
        var $myForm = $('#formCredentials');
        if (!$myForm[0].checkValidity()) {
            // If the form is invalid, submit it. The form won't actually submit;
            // this will just cause the browser to display the native HTML5 error messages.
            $myForm.find(':submit').click();
        } else {
            $('#formCredentials').submit();
        }
    });
    $('#formCredentials').submit(function(event) {
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
        $('#credentialModal').modal('hide');
        return false;
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
                Bucket: state.s3Bucket
            };
            if (window.console) { console.log('Started upload'); }
            s3.upload(params, function(err, data) {
                if (window.console) { console.log(err ? 'ERROR!' : 'UPLOADED!'); }
                if (!err) {
                    $('#uploadModal').modal('hide');
                    listObjects(s3, state.s3Bucket, state.prefix, state.marker);
                    if (window.console) { console.log('Finished upload' + data); }
                }
            });
        } else {
            if (window.console) { console.log('nothing to upload'); }
        }
    });

    $('#buckets-search').click(function() {
        aws_prefix_search();
    });

    $('#buckets-search-query').keydown(function(e) {
        var keypressed = event.keyCode || event.which;
        // Enter is pressed
        if (keypressed == 13) { aws_prefix_search(); }
    });
}


document.addEventListener('DOMContentLoaded', function () {
//$( document ).ready(function() {

    if (window.console) { console.log('[main]', 'init handlebar render'); }
    var sandbox = document.getElementById('sandbox');
    renderer = sandbox.contentWindow;

    var templates = $('script[id$=-template]');
    sandbox.addEventListener('load', function() {
    //$(sandbox).ready(function() {
        if (window.console) { console.log('[main]', 'compile all templates'); }
        $.each(templates, function(i, elem) {
            var message = { command: 'new', name: elem.id.replace('-template', ''), source: elem.innerHTML };
            renderer.postMessage(message, '*');
        });
    });

    if (window.console) { console.log('[main]', 'Added render message listner'); }
    window.addEventListener('message', function(event) {
        if (event.data.command == 'render') {
            if (event.data.html) {
                $('#'+event.data.name).html(event.data.html);
                $('a.s3-folder').click(function () {
                    // window.location.hash = state.prefix+':'+state.marker;
                    prefix = $(this).attr('data-prefix');
                    var marker = $(this).attr('data-marker');
                    listObjects(s3, state.s3Bucket, prefix, marker);
                    window.history.pushState(state, state.prefix+':'+state.marker);
                });
            }
        } else {
            if (window.console) { console.log('[message]', 'name:', event.data.name); }
        }
    });


    setup();
    var p1 = new Promise(function(resolve, reject) {
        chrome.storage.local.get('first_run', function(result) {
            var first_run = result['first_run'];
            if (window.console) { console.log('[chrome.storage] get first_run ', first_run); }
            if (first_run) {
                reject(true);
            } else {
                resolve(true);
            }
        });
    });
    var p2 = p1.then(function(val) {
        main();
    }).catch(function(reason) {
        $('#credentialModal').modal('show');
    });
    window.onpopstate = function(event) {
        if (event.state) {
            // listBuckets(s3, event.state.s3Bucket);
            listObjects(s3, event.state.s3Bucket, event.state.prefix, event.state.marker);
            console.log('location: ' + document.location + ', state: ' + JSON.stringify(event.state));
        }
    };
});
//});
