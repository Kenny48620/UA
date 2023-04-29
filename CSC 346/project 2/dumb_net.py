#! usr/bin/python3
import sys
from socket import *

def main():
    
    server= sys.argv[1]
    port  = int(sys.argv[2])
    sock  = socket()
    
    address = (server, port)
    sock.connect(address)
    
    # send msg to the server
    do_client(sock)
    # receive data from the server
    while (True):
        data = sock.recv(1024).decode()
        print("Part of data  =========>  "+data)
        if not data:
            break

    sock.close()

def do_client(sock):
    msg = input()
    http ="\r\n"
    sock.sendall((msg+http).encode())






if __name__ == '__main__':
    main()
