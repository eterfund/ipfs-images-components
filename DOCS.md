## Classes

<dl>
<dt><a href="#Thumbnail">Thumbnail</a></dt>
<dd><p>Represents Thumbnail class.</p>
</dd>
<dt><a href="#Pin">Pin</a></dt>
<dd><p>Represents an interface to interact with IPFS daemon and Redis
to pin attachments.</p>
</dd>
<dt><a href="#Cleaner">Cleaner</a></dt>
<dd><p>Represents a cleaner for attachments.</p>
</dd>
<dt><a href="#Ipfs">Ipfs</a></dt>
<dd><p>Represents an interface to interact with IPFS daemon to download and upload
attachments.</p>
</dd>
<dt><a href="#Metadata">Metadata</a></dt>
<dd><p>Represents an interface to interact with Redis to add and get records.</p>
</dd>
<dt><a href="#FileNotFoundError">FileNotFoundError</a></dt>
<dd><p>Represents custom error which is thrown when file is not found.</p>
</dd>
<dt><a href="#WinstonLoggerWrapper">WinstonLoggerWrapper</a></dt>
<dd><p>Represents a wrapper for winston logger.</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#parseJson">parseJson()</a> ⇒ <code>Array.&lt;String&gt;</code></dt>
<dd><p>Parses JSON from project root to array.</p>
</dd>
<dt><a href="#createTransports">createTransports(transportsJson, [formatFunc])</a> ⇒ <code>Array.&lt;Winston.transports&gt;</code></dt>
<dd><p>Creates transports for logger.</p>
</dd>
<dt><a href="#handleMessage">handleMessage(message)</a> ⇒ <code>String</code></dt>
<dd><p>Adds stack trace to error messages.</p>
</dd>
<dt><a href="#format">format(options)</a> ⇒ <code>String</code></dt>
<dd><p>Formatter function.</p>
</dd>
<dt><a href="#time">time()</a> ⇒ <code>Date</code></dt>
<dd><p>Returns date in local format.</p>
</dd>
</dl>

<a name="Thumbnail"></a>

## Thumbnail
Represents Thumbnail class.

**Kind**: global class  

* [Thumbnail](#Thumbnail)
    * [new Thumbnail()](#new_Thumbnail_new)
    * [.getThumbsDir(hash, size)](#Thumbnail+getThumbsDir) ⇒ <code>String</code>
    * [.getThumbsPath(hash, size)](#Thumbnail+getThumbsPath) ⇒ <code>String</code>
    * [.serve(hash, size)](#Thumbnail+serve) ⇒ <code>Promise</code>
    * [.create(inputStream, hash, size)](#Thumbnail+create) ⇒ <code>Promise</code>

<a name="new_Thumbnail_new"></a>

### new Thumbnail()
Constructor for Thumbnail class.

<a name="Thumbnail+getThumbsDir"></a>

### thumbnail.getThumbsDir(hash, size) ⇒ <code>String</code>
Concatenates pieces to return path to directory for thumbnail.

**Kind**: instance method of [<code>Thumbnail</code>](#Thumbnail)  
**Returns**: <code>String</code> - Path to directory for thumbnail.  

| Param | Type | Description |
| --- | --- | --- |
| hash | <code>String</code> | IPFS hash. |
| size | <code>Number</code> | Size of thumbnail. |

<a name="Thumbnail+getThumbsPath"></a>

### thumbnail.getThumbsPath(hash, size) ⇒ <code>String</code>
Concatenates pieces to return path to thumbnail.

**Kind**: instance method of [<code>Thumbnail</code>](#Thumbnail)  
**Returns**: <code>String</code> - Path to thumbnail.  

| Param | Type | Description |
| --- | --- | --- |
| hash | <code>String</code> | IPFS hash. |
| size | <code>Number</code> | Size of thumbnail. |

<a name="Thumbnail+serve"></a>

### thumbnail.serve(hash, size) ⇒ <code>Promise</code>
Serves thumbnail.

**Kind**: instance method of [<code>Thumbnail</code>](#Thumbnail)  
**Returns**: <code>Promise</code> - Stream of thumbnail.  

| Param | Type | Description |
| --- | --- | --- |
| hash | <code>String</code> | IPFS hash. |
| size | <code>Number</code> | Size of thumbnail. |

<a name="Thumbnail+create"></a>

### thumbnail.create(inputStream, hash, size) ⇒ <code>Promise</code>
Creates thumbnail for image.

**Kind**: instance method of [<code>Thumbnail</code>](#Thumbnail)  
**Returns**: <code>Promise</code> - Stream of thumbnail.  

| Param | Type | Description |
| --- | --- | --- |
| inputStream | <code>Stream</code> | Stream of image. |
| hash | <code>String</code> | IPFS hash of thumbnail. |
| size | <code>Number</code> | Size of thumbnail. |

<a name="Pin"></a>

## Pin
Represents an interface to interact with IPFS daemon and Redis
to pin attachments.

**Kind**: global class  

* [Pin](#Pin)
    * [new Pin()](#new_Pin_new)
    * [.all()](#Pin+all) ⇒ <code>Promise</code>

<a name="new_Pin_new"></a>

### new Pin()
Constructor for Pin class.

<a name="Pin+all"></a>

### pin.all() ⇒ <code>Promise</code>
Pins attachments to local storage for which there are records in Redis.

**Kind**: instance method of [<code>Pin</code>](#Pin)  
**Returns**: <code>Promise</code> - Number of pinned attachments.  
<a name="Cleaner"></a>

## Cleaner
Represents a cleaner for attachments.

**Kind**: global class  

* [Cleaner](#Cleaner)
    * [new Cleaner(expire, interval, index, prefix)](#new_Cleaner_new)
    * [.buildIndex()](#Cleaner+buildIndex) ⇒ <code>Promise</code>
    * [.delAttachment(hash)](#Cleaner+delAttachment) ⇒ <code>Promise</code>
    * [.run()](#Cleaner+run) ⇒ <code>Promise</code>

<a name="new_Cleaner_new"></a>

### new Cleaner(expire, interval, index, prefix)
Constructor for class cleaner.


| Param | Type | Description |
| --- | --- | --- |
| expire | <code>Number</code> | Attachments expiration time in seconds. |
| interval | <code>Number</code> | Cleaning interval in seconds. |
| index | <code>String</code> | Name of sorted set of attachments upload date. |
| prefix | <code>String</code> | Prefix for attachments keys. |

<a name="Cleaner+buildIndex"></a>

### cleaner.buildIndex() ⇒ <code>Promise</code>
Builds sorted set of datetimes of already uploaded attachments.

**Kind**: instance method of [<code>Cleaner</code>](#Cleaner)  
**Returns**: <code>Promise</code> - Number of elements added to the set.  
<a name="Cleaner+delAttachment"></a>

### cleaner.delAttachment(hash) ⇒ <code>Promise</code>
Deletes attachment for hash from both IPFS and Redis.

**Kind**: instance method of [<code>Cleaner</code>](#Cleaner)  
**Returns**: <code>Promise</code> - Resolves if deleted, rejects otherwise.  

| Param | Type | Description |
| --- | --- | --- |
| hash | <code>String</code> | IPFS hash of attachment. |

<a name="Cleaner+run"></a>

### cleaner.run() ⇒ <code>Promise</code>
Runs cleaner on the current set.

**Kind**: instance method of [<code>Cleaner</code>](#Cleaner)  
**Returns**: <code>Promise</code> - Number of deleted attachments.  
<a name="Ipfs"></a>

## Ipfs
Represents an interface to interact with IPFS daemon to download and upload
attachments.

**Kind**: global class  

* [Ipfs](#Ipfs)
    * [new Ipfs()](#new_Ipfs_new)
    * [.pin(hash)](#Ipfs+pin) ⇒ <code>Promise</code>
    * [.serve(hash)](#Ipfs+serve) ⇒ <code>Promise</code>
    * [.unpin(hash)](#Ipfs+unpin) ⇒ <code>Promise</code>
    * [.upload(file)](#Ipfs+upload) ⇒ <code>Promise</code>

<a name="new_Ipfs_new"></a>

### new Ipfs()
constructor for Ipfs class.

<a name="Ipfs+pin"></a>

### ipfs.pin(hash) ⇒ <code>Promise</code>
Stores an IPFS object from a given path locally to disk.

**Kind**: instance method of [<code>Ipfs</code>](#Ipfs)  
**Returns**: <code>Promise</code> - Pinned object.  

| Param | Type | Description |
| --- | --- | --- |
| hash | <code>String</code> | IPFS hash. |

<a name="Ipfs+serve"></a>

### ipfs.serve(hash) ⇒ <code>Promise</code>
Serves attachment to the client.

**Kind**: instance method of [<code>Ipfs</code>](#Ipfs)  
**Returns**: <code>Promise</code> - Readable Stream of attachment.  

| Param | Type | Description |
| --- | --- | --- |
| hash | <code>String</code> | IPFS hash. |

<a name="Ipfs+unpin"></a>

### ipfs.unpin(hash) ⇒ <code>Promise</code>
Removes the pin from the given object allowing it to be garbage
collected if needed.

**Kind**: instance method of [<code>Ipfs</code>](#Ipfs)  
**Returns**: <code>Promise</code> - Unpinned object.  

| Param | Type | Description |
| --- | --- | --- |
| hash | <code>String</code> | IPFS hash. |

<a name="Ipfs+upload"></a>

### ipfs.upload(file) ⇒ <code>Promise</code>
Uploads attachment to IPFS.

**Kind**: instance method of [<code>Ipfs</code>](#Ipfs)  
**Returns**: <code>Promise</code> - IPFS hash of uploaded attachment.  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>File</code> | Multipart/form-data file. |

<a name="Metadata"></a>

## Metadata
Represents an interface to interact with Redis to add and get records.

**Kind**: global class  

* [Metadata](#Metadata)
    * [new Metadata()](#new_Metadata_new)
    * [.addRecord(hash, mimetype, size)](#Metadata+addRecord) ⇒ <code>Array.&lt;Promise&gt;</code>
    * [.getRecord(hash)](#Metadata+getRecord) ⇒ <code>Promise</code>
    * [.delRecord(hash)](#Metadata+delRecord) ⇒ <code>Promise</code>

<a name="new_Metadata_new"></a>

### new Metadata()
Constructor for Metadata class.

<a name="Metadata+addRecord"></a>

### metadata.addRecord(hash, mimetype, size) ⇒ <code>Array.&lt;Promise&gt;</code>
Adds record for attachments to Redis.

**Kind**: instance method of [<code>Metadata</code>](#Metadata)  
**Returns**: <code>Array.&lt;Promise&gt;</code> - Array of array of numbers of added records and
                          array of numbers of elements added to the set.  

| Param | Type | Description |
| --- | --- | --- |
| hash | <code>String</code> | IPFS hash of attachment. |
| mimetype | <code>String</code> | MIME type of attachment. |
| size | <code>Number</code> | Size of attachment. |

<a name="Metadata+getRecord"></a>

### metadata.getRecord(hash) ⇒ <code>Promise</code>
Gets record for attachment from Redis.

**Kind**: instance method of [<code>Metadata</code>](#Metadata)  
**Returns**: <code>Promise</code> - Record for attachment.  

| Param | Type | Description |
| --- | --- | --- |
| hash | <code>String</code> | IPFS hash of attachment. |

<a name="Metadata+delRecord"></a>

### metadata.delRecord(hash) ⇒ <code>Promise</code>
Deletes record for attachment from Redis.

**Kind**: instance method of [<code>Metadata</code>](#Metadata)  
**Returns**: <code>Promise</code> - Resolves if deleted, otherwise rejects.  

| Param | Type | Description |
| --- | --- | --- |
| hash | <code>String</code> | IPFS hash of attachment. |

<a name="FileNotFoundError"></a>

## FileNotFoundError
Represents custom error which is thrown when file is not found.

**Kind**: global class  
<a name="new_FileNotFoundError_new"></a>

### new FileNotFoundError(message)
constructor for FileNotFoundError class.


| Param | Type | Description |
| --- | --- | --- |
| message | <code>String</code> | Error message. |

<a name="WinstonLoggerWrapper"></a>

## WinstonLoggerWrapper
Represents a wrapper for winston logger.

**Kind**: global class  

* [WinstonLoggerWrapper](#WinstonLoggerWrapper)
    * [new WinstonLoggerWrapper(logger, [moduleName])](#new_WinstonLoggerWrapper_new)
    * [.getWrapperForModule(moduleName)](#WinstonLoggerWrapper+getWrapperForModule) ⇒ [<code>WinstonLoggerWrapper</code>](#WinstonLoggerWrapper)
    * [.log(level, ...messages)](#WinstonLoggerWrapper+log)

<a name="new_WinstonLoggerWrapper_new"></a>

### new WinstonLoggerWrapper(logger, [moduleName])
constructor for WinstonLoggerWrapper class.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| logger | <code>Winston.Logger</code> |  | An instance of winston.Logger. |
| [moduleName] | <code>String</code> | <code>&#x27;&#x27;</code> | Name of module in which logger                                          is used. |

<a name="WinstonLoggerWrapper+getWrapperForModule"></a>

### winstonLoggerWrapper.getWrapperForModule(moduleName) ⇒ [<code>WinstonLoggerWrapper</code>](#WinstonLoggerWrapper)
Returns an instance of WinstonLoggerWrapper.

**Kind**: instance method of [<code>WinstonLoggerWrapper</code>](#WinstonLoggerWrapper)  
**Returns**: [<code>WinstonLoggerWrapper</code>](#WinstonLoggerWrapper) - An instance of
                                          WinstonLoggerWrapper.  

| Param | Type | Description |
| --- | --- | --- |
| moduleName | <code>String</code> | Name of module in which logger                                           is used. |

<a name="WinstonLoggerWrapper+log"></a>

### winstonLoggerWrapper.log(level, ...messages)
Logs message.

**Kind**: instance method of [<code>WinstonLoggerWrapper</code>](#WinstonLoggerWrapper)  

| Param | Type | Description |
| --- | --- | --- |
| level | <code>String</code> | Logging level. |
| ...messages | <code>Array.&lt;String&gt;</code> | Messages to log. |

<a name="parseJson"></a>

## parseJson() ⇒ <code>Array.&lt;String&gt;</code>
Parses JSON from project root to array.

**Kind**: global function  
**Returns**: <code>Array.&lt;String&gt;</code> - JSON like array of settings.  
<a name="createTransports"></a>

## createTransports(transportsJson, [formatFunc]) ⇒ <code>Array.&lt;Winston.transports&gt;</code>
Creates transports for logger.

**Kind**: global function  
**Returns**: <code>Array.&lt;Winston.transports&gt;</code> - Array of transports.  

| Param | Type | Default | Description |
| --- | --- | --- | --- |
| transportsJson | <code>Array.&lt;String&gt;</code> |  | Arrays of transports                                                    options. |
| [formatFunc] | <code>function</code> | <code>format</code> | Formatter. |

<a name="handleMessage"></a>

## handleMessage(message) ⇒ <code>String</code>
Adds stack trace to error messages.

**Kind**: global function  
**Returns**: <code>String</code> - Logging message.  

| Param | Type | Description |
| --- | --- | --- |
| message | <code>String</code> | Logging message. |

<a name="format"></a>

## format(options) ⇒ <code>String</code>
Formatter function.

**Kind**: global function  
**Returns**: <code>String</code> - Formatted logging message.  

| Param | Type | Description |
| --- | --- | --- |
| options | <code>Array.&lt;String&gt;</code> | Formatting options. |

<a name="time"></a>

## time() ⇒ <code>Date</code>
Returns date in local format.

**Kind**: global function  
**Returns**: <code>Date</code> - Current date in ru-Ru locale.  
