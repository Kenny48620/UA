#! usr/bin/python3

import sys
from  socket import *

def main():
        
    hostname = sys.argv[1]
    port = int(sys.argv[2])

    # acting like a server
    if (hostname == "server"):
        server_sock = socket()
        server_addr = ("0.0.0.0", port)

        # bind and listen
        server_sock.bind(server_addr)
        server_sock.listen(5)

        # accepting connection
        print("Start listening")
        print("Waiting for client...")
        #  if a connection closed, it would go back and accept() another connection
        while True:
            (conn_sock, conn_addr)=server_sock.accept()
            while True:
                # get data from the client
                data = conn_sock.recv(1024).decode()
                # if get a blank line from the client
                if (data.strip() == ""):
                    print("Connection break!")
                    conn_sock.close()
                    break
                # or if get a empty buffer from the client
                if not data:
                    print("Connection break!")
                    conn_sock.sendall("".encode())
                    conn_sock.close()
                    break
                
                print("Client:", data)
            
                # response to the client 
                print("You: ", end='')
                response = input()
                conn_sock.sendall(response.encode())
                # if user enter a blank line
                if (response.strip() == ""):
                    print("Connection break!")
                    conn_sock.close()
                    break

    # acting like a client
    else:
        client_sock = socket()
        addr = (hostname, port)
        client_sock.connect(addr)

        while True:
            # reading from the user
            print("You: ", end='')
            msg = input()
            client_sock.sendall(msg.encode())
            # breaks the connection if it gets a blank line
            if (msg.strip() == ""):
                print("Connection break!")
                client_sock.close()
                break

            # receive data from the server
            data = client_sock.recv(1024).decode()
            if (data.strip() == ""):
                print("Connection break!")
                client_sock.close()
                break
            
            # if receives an empty buffer, breaks the connection!
            if not data:
                print("Connection break!")
                client_sock.sendall("".encode())
                client_sock.close()
                break
            print("Server:", data)
        
        #terminates it!
        client_sock.close()


if __name__ == '__main__':
    main()
