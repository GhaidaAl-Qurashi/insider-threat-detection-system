import http.server
import socketserver

PORT = 8000


class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    with socketserver.TCPServer(("0.0.0.0", PORT), CORSRequestHandler) as httpd:
        print(f"CORS server is running on port {PORT}")
        print(f"  http://100.115.168.118:{PORT}/dashboard_data.json")
        httpd.serve_forever()
