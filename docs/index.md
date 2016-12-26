---
# You don't need to edit this file, it's empty on purpose.
# Edit theme's home layout instead if you wanna make some changes
# See: https://jekyllrb.com/docs/themes/#overriding-theme-defaults
layout: default
title: {{ site.name }}
---
# What it does #

This is a chrome extention to access and upload AWS S3 files.


## Why we need one more S3 file access plugin ##

* MyS3Browser uses AWS JS SDK, This should keep this compatible with all the latest changes AWS S3 has done. It should remain compatible as long as AWS is maintaining their JS SDK.
* This extention is open source, If you need a specific feature you can help me add it. 

## FAQ ##

### Does this support S3 Region Specific Endpoints? ###

Yes, It does. In fact that's the feature compelled me to create it.

### Can I download from this? ###

Yes, all links are presigned downloadable links. Works for 15mins max.

### Can I Upload from this? ###

Yes.

