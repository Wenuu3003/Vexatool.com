import { expect, it } from 'vitest';
import { extractGoogleFileId } from './googleDriveLink';
it.each(['https://docs.google.com/document/d/fixture123/edit','https://docs.google.com/spreadsheets/d/fixture123/edit','https://drive.google.com/file/d/fixture123/view','https://drive.google.com/open?id=fixture123'])('parses Google link %s', link => expect(extractGoogleFileId(link)).toBe('fixture123'));
it.each(['https://example.com/d/fixture123/edit','https://docs.google.com.evil.test/d/fixture123','http://docs.google.com/d/fixture123','invalid'])('rejects invalid link %s', link => expect(extractGoogleFileId(link)).toBeNull());
