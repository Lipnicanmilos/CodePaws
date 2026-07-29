"""Kódolabky — vývojový server pre lokálne spúšťanie hry a testov.

Prečo nestačí `python -m http.server`: posiela `Last-Modified`, ale žiadne
`Cache-Control`. Prehliadač si podľa toho sám odhadne, ako dlho smie súbor
držať v cache — a pri ES moduloch a JSON leveloch to znamená, že po úprave
súboru beží ďalej stará verzia. Testy potom zelenajú na kóde, ktorý na disku
už nie je, a hľadá sa neexistujúca chyba.

Tento server preto pri každej odpovedi cache zakáže. Do produkcie nejde —
GitHub Pages statické súbory servíruje sám.

Spustenie:  python server/dev_server.py [port] [priečinok]
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

DEFAULT_PORT = 8140


class NoCacheHandler(SimpleHTTPRequestHandler):
    """Rovnaký statický server, len bez cache."""

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, max-age=0')
        super().end_headers()

    # Tichší výpis — pri načítaní hry chodí desiatky requestov naraz.
    def log_message(self, fmt, *args):
        if not args or not str(args[0]).startswith('GET'):
            super().log_message(fmt, *args)


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_PORT
    root = sys.argv[2] if len(sys.argv) > 2 else '.'

    handler = partial(NoCacheHandler, directory=root)
    with ThreadingHTTPServer(('127.0.0.1', port), handler) as httpd:
        print(f'Kodolabky: http://localhost:{port}  (bez cache, priecinok {root})')
        httpd.serve_forever()


if __name__ == '__main__':
    main()
