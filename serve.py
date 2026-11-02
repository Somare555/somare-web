#!/usr/bin/env python3
"""Local preview for somare.app. Serves the static files and stubs
/api/subscribe so local waitlist signups never reach Flodesk."""
import json, os, socket, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        # Always serve the latest edit; no stale cached page on reload.
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

    def do_POST(self):
        if self.path != '/api/subscribe':
            self.send_error(404); return
        body = self.rfile.read(int(self.headers.get('Content-Length') or 0))
        email = (json.loads(body or b'{}') or {}).get('email')
        print(f'[subscribe stub] {email}', flush=True)
        code, out = (200, {'ok': True}) if email else (400, {'error': 'Email required'})
        data = json.dumps(out).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers(); self.wfile.write(data)

os.chdir(os.path.dirname(os.path.abspath(__file__)))
port = int(os.environ.get('PORT') or (sys.argv[1] if len(sys.argv) > 1 else 8080))
print(f'Serving http://localhost:{port}', flush=True)
class DualStackServer(ThreadingHTTPServer):
    # localhost resolves to ::1 in the browser, so listen on IPv6 and IPv4.
    address_family = socket.AF_INET6
    def server_bind(self):
        self.socket.setsockopt(socket.IPPROTO_IPV6, socket.IPV6_V6ONLY, 0)
        super().server_bind()

DualStackServer(('::', port), Handler).serve_forever()
