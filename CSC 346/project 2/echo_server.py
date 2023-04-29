#! usr/bin/python3

import threading
from socket import *

def main():

    server = "0.0.0.0"
    port = 80
    
    global count_client
    count_client = 0

    server_sock = socket()
    server_addr = (server, port)
    
    # bind and listen
    server_sock.bind(server_addr)
    server_sock.listen(5)
    
    print("Start listening!!\n")
    threads = []
    while True:
        (conn_sock, conn_addr) = server_sock.accept()
        print("Connected to "+ str(conn_addr))
        count_client += 1
        print(str(count_client) + " clients are visiting this server\n")
        newClient = threading.Thread(target=worker, args=(conn_sock, conn_addr)).start()
        threads.append(newClient)
        
    for c in threads: 
        c.join() 

def worker(conn_sock, conn_addr):
        while True:
            # receive data from the client
            data = conn_sock.recv(1024).decode()
            if not data:
                conn_sock.close()
                break
            if (data.strip()==""):
                conn_sock.close()
                break
            # print("(From client " +str(conn_addr)+")", data)
        
            # response and send data back to the client
            response = "Hi, I'm server. I've received the data: "+ data
            conn_sock.sendall(response.encode())
        
        global count_client
        count_client -= 1
        print("Client " +str(conn_addr)+" leaved the server\n"+"There are "+str(count_client)+" clients visting this server\n")
        
if __name__ == '__main__':
    main()
