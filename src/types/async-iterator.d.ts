/////////////////////////////
/// Window Async Iterable APIs
/////////////////////////////

interface FileSystemDirectoryHandle {
    [Symbol.asyncIterator](): AsyncIterableIterator<[string, FileSystemDirectoryHandle]>;
    entries(): AsyncIterableIterator<[string, FileSystemDirectoryHandle]>;
    keys(): AsyncIterableIterator<string>;
    values(): AsyncIterableIterator<FileSystemDirectoryHandle>;
}