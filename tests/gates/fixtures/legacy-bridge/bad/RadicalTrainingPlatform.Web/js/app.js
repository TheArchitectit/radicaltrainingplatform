// Fixture: a JS call to a type the Legacy host does not implement.
//
// The promise this returns can only reach its 10-second timeout and then
// report "Bridge timeout for get_stats" — which reads as a dead host rather
// than an unimplemented type. scripts/check-legacy-bridge.py must fail on it.
import { bridge } from './core/BridgeClient.js';

bridge.post('ready');
bridge.send('get_stats');
