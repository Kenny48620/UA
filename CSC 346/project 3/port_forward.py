#! /usr/bin/python3
'''
	Name: Kaichun Lee
	Class: CS346
	Description: This is a fowarder.

'''

import sys
import random as rd
import threading

from socket import*

def main():

	length = len(sys.argv)
	if length == 2:
		dest_addr = sys.argv[1].split(":")
		dest_name = dest_addr[0]
		dest_port = dest_addr[1]

		serv_name = "0.0.0.0"
		serv_port = rd.randint(1024, 65535)

	elif length == 3:
		dest_addr = sys.argv[2].split(":")
		dest_name = dest_addr[0]
		dest_port = dest_addr[1]

		serv_addr = sys.argv[1].split(":")
		serv_name = serv_addr[0]
		serv_port = serv_addr[1]

		# if the user didn't provide server name, set it to 0.0.0.0
		if serv_name == "":
			serv_name = "0.0.0.0"
		# if the user didn't provide server port, set it randomly
		if serv_port ==  "":
			serv_port = rd.randint(1024, 65535)

	print("server "+serv_name+":"+serv_port)
	print("destination_server: "+dest_name+":"+dest_port)

	server = socket()
	server_addr = (serv_name, int(serv_port))
	server.bind(server_addr)
	server.listen(5)

	#print("Start listenning...")
	print("FORWARDING: " + serv_name + ":" + serv_port + " -> "+dest_name+":"+dest_port)
	while True:
		(client, client_addr) = server.accept()
		print("New connection accepted from",client_addr)

		destination_server = socket()
		destination_server_addr = (dest_name, int(dest_port))
		destination_server.connect(destination_server_addr)
		
		threadA = threading.Thread(target = myclient, args=(client, destination_server))
		threadB = threading.Thread(target = destinationServer, args=(destination_server, client))
		threadA.start()
		threadB.start()
		

def myclient(client, destination_server):
	try:
		while True:

			data = client.recv(1024)
			if not data:
				client.close()
				destination_server.close()
				print("Connection break with client")
				return 

			#print("client.....=>" + data.decode() +"=>......destination_server")
			destination_server.sendall(data)
	
	except Exception as e:
		client.close()
		destination_server.close()
		print("both close")
	

def destinationServer(destination_server,client):
	try:
		while True:
			data = destination_server.recv(1024)
			if not data:
				destination_server.close()
				client.close()
				print("Connection break with destination_server")
				return

			#print("client......<=" + data.decode() +"<=......destination_server")
			#print(data.decode)
			client.sendall(data)
	
	except Exception as e:
		destination_server.close()
		client.close()
		print("both close")

	
if __name__ == '__main__':
	main()