import { Injectable } from '@angular/core';

import { MessageService } from './message.service';
import { CredentialService } from './credential.service';

import { Observable } from 'rxjs/Rx';
import { of } from 'rxjs/observable/of';
import { catchError, map, tap } from 'rxjs/operators';

import * as AWS from 'aws-sdk';

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

@Injectable()
export class AwsS3Service {

  constructor(
    private credentialService: CredentialService,
    private messageService: MessageService
  ) {
    let credential = this.credentialService.getCredential();
  }


  listObjects(s3, s3Bucket, s3Prefix, s3Search, s3Marker, callback) {
    var prefix = s3Prefix.split('+').join(' ');
    if(s3Search) {
      prefix += s3Search;
    }
    // var s3Bucket = s3_bucket;
    // if(s3_bucket == '') {
    //   s3Bucket = $('#buckets-select').val();
    // }
    // var search_prefix = '';
    // var marker = s3_marker;
    let params = {
      Bucket: s3Bucket,
      Delimiter: '/',
      Prefix: decodeURIComponent(prefix), // prefix
      EncodingType: 'url',
      MaxKeys: 100
    };
    if(s3Marker !== 'null') {
      params['ContinuationToken']= s3Marker;
    }


    // if (window.console) { console.log('[function.listObjects]', 's3://' + s3Bucket +  '.' + s3.endpoint.hostname + '/' + prefix + '#' + marker ); }
    // state = {s3Bucket: s3Bucket, prefix: prefix, marker: marker };
    // var tags = prefix.trim().split('/');
    // search_prefix = tags.pop(); // Remove empty element due to last slash

    s3.listObjectsV2(params, function(err, files) {
      if (err) {
        // an error occurred
        if (window.console) { console.log(err.name, err.stack); }
        // Make sure the callback is a function
        if (typeof callback === 'function') {
          // Call it, since we have confirmed it is callable
          callback(err);
        }
      } else {
        // successful response
        if (window.console) { console.log('[function.listObjects]', 'Folders:', files.CommonPrefixes.length, 'Files:', files.Contents.length); }
        files.CommonPrefixes = files.CommonPrefixes.map((item) => {
          item.HumanPrefix = decodeURIComponent(item.Prefix.split('\+').join(' ').replace(prefix, ''));
          return item;
        });
        files.Contents = files.Contents.map((item) => {
          item.HumanKey = decodeURIComponent(item.Key.split('+').join(' ').replace(prefix, ''));
          item.HumanSize = humanFileSize(item.Size, true);
          item.DownloadUrl = s3.getSignedUrl('getObject', {Bucket: s3Bucket, Key: decodeURIComponent(item.Key.replace('+', ' '))});
          return item;
        });
        callback(false, files);

        //     var folders_context = files.CommonPrefixes.map(function(obj) {
        //       var map = {};
        //       map['prefix'] = obj.Prefix;
        //       map['name'] = obj.Prefix.replace(prefix, '');
        //       return map;
        //     });
        //     var files_context = files.Contents.map(function(obj) {
        //       var map = {};
        //       map['filename'] = decodeURIComponent(search_prefix+obj.Key.replace('+', ' ').replace(prefix, ''));
        //       map['url'] = s3.getSignedUrl('getObject', {Bucket: s3Bucket, Key: decodeURIComponent(obj.Key.replace('+', ' '))});
        //       map['prefix'] = obj.Prefix;
        //       map['LastModified'] = obj.LastModified;
        //       map['size'] = humanFileSize(obj.Size, true);
        //       return map;
        //     });
        //     var isTruncated = false;
        //     if (files.IsTruncated) {
        //       isTruncated = {marker: files.NextMarker};
        //     }
        //     renderer.postMessage({
        //       command: 'render', context: {
        //         folders: folders_context, files: files_context, isTruncated: isTruncated
        //       }, name: 'main-table'
        //     }, '*');

        //     if (window.console) { console.log('[listObjects] [tags] values: ' + tags); }
        //     if (window.console) { console.log('[listObjects] [tags] length: ' + tags.length); }


        //     var crumbs = [];
        //     if (tags.length > 1) {
        //       tags.forEach(function(currentValue, index, array) {
        //         crumbs.push({
        //           prefix: array.slice(0,index+1).join('/')+'/',
        //           name: currentValue
        //         });
        //       });
        //       crumbs.pop();
        //     }

        //     renderer.postMessage({
        //       command: 'render',
        //       context: {
        //         root: 's3://' + s3Bucket,
        //         crumbs: crumbs,
        //         active: tags.pop()
        //       },
        //       name: 'top-breadcrumb'
        //     }, '*');

        //     // Make sure the callback is a function
        //     if (typeof callback === 'function') {
        //       // Call it, since we have confirmed it is callable
        //       callback(err=false);
        //     }

      }
    });

  }

  listBuckets(s3, callback) {
    if (window.console) { console.log('[function.listBuckets]', 'starting'); }
    s3.listBuckets(function(err, buckets) {
      if (err) {
        if (window.console) { console.log(err, err.stack); } // an error occurred
        // Make sure the callback is a function
        if (typeof callback === 'function') {
          // Call it, since we have confirmed it is callable
          callback(err);
        }

      } else {
        if (window.console) { console.log('[function.listBuckets]', 'Buckets', buckets.Buckets.length); }
        // successful response
        //       var select = $('#buckets-select').empty();
        callback(false, buckets.Buckets);
        //       $.each(buckets.Buckets, function(i, bucket) {
        //         var option = document.createElement('option');
        //         option.text = bucket.Name;
        //         if (s3Bucket === '') {
        //           s3Bucket = bucket.Name;
        //           // chrome.storage.local.set({'s3-bucket': bucket.Name }, function() {
        //           //     if (window.console) { console.log('[chrome.storage]', 's3-bucket updated'); }
        //           // });
        //         }
        //         if (s3Bucket === bucket.Name) { $(option).attr('selected', true); }
        //         select.append(option);
        //       });

        //       // Make sure the callback is a function
        //       if (typeof callback === 'function') {
        //         // Call it, since we have confirmed it is callable
        //         callback(err=false);
        //       }

        //       select.change(function() {
        //         var s3Bucket = select.val();
        //         if (window.console) { console.log(s3Bucket); }           // successful response
        //         chrome.storage.local.set({'s3-bucket': s3Bucket}, function() {
        //           if (window.console) { console.log('[chrome.storage]', 's3-bucket updated'); }
        //         });
        //         var s3Region = '';

        //         var p1 = new Promise(function(resolve, reject) {
        //           var params = {
        //             Bucket: s3Bucket /* required */
        //           };
        //           s3.getBucketLocation(params, function(err, data) {
        //             if (err) {
        //               if (window.console) { console.log(err, err.stack); } // an error occurred
        //             } else {
        //               s3Region = data.LocationConstraint;
        //               if (window.console) { console.log('[function.listBuckets]', 's3-region updated'); } // successful response
        //               resolve(true);
        //             }
        //           });
        //         });
        //         var p2 = p1.then(function(val) {
        //           return new Promise(function(resolve, reject) {
        //             AWS.config.region = s3Region;
        //             s3 = new AWS.S3();
        //             if(window.console)  { console.log('[function.listBuckets]', 'listObjects', s3Bucket); }
        //             listObjects(s3, s3Bucket, '');
        //           });
        //         });
        //       });
      }
    });
  }

}
