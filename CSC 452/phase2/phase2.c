/**
 * 	
 *	Program: Phase2.c
 *  Course:  CSC 452
 *  Author:  Kaichun Lee
 * 
 **/

#include <phase1.h>
#include <phase2.h>
#include <stdio.h>
#include <stdlib.h>
#include <usloss.h>
#include <stdbool.h> 
#include <string.h>

#define EMPTY			        0
#define OCCUPY			        1
#define DESTROYED				2 // RELEASED

#define CONSUMER_BLOCKED	    11
#define PRODUCER_BLOCKED	    12
#define NONE_BLOCKED            13

#define COND_TRUE				true
#define COND_FALSE				false

#define CLOCK_MID				0
#define TERM1_MID				1
#define TERM2_MID				2
#define TERM3_MID				3
#define TERM4_MID				4
#define DISK1_MID				5
#define DISK2_MID				6


typedef struct MBOX  MBOX;
typedef struct MBOX  *MBOX_ptr;
typedef struct MSLOT MSLOT;
typedef struct MSLOT *MSLOT_ptr;
typedef	struct PROCESS   PROCESS;
typedef	struct PROCESS   *PROCESS_ptr;

struct MBOX{
	int MID;
	int status;
	MSLOT_ptr slotHead;
	MSLOT_ptr slotTail;
	int       numSlots;
	int   numSlotsUsed;
	int   	  slotSize; // the largest allowable message that can be sent through this mailbox
	PROCESS_ptr consumerWaitList;
	PROCESS_ptr producerWaitList;
};

// Each slot must be able to handle messages up to MAX_MESSAGE bytes.
struct MSLOT{
	int MID;
	int status;
	char msg[MAX_MESSAGE];
	MSLOT_ptr nextSlot;
	int size;
};

// shadow process table to Phase 1 PTE
struct PROCESS{
	int pid;
	int blockStatus;
	int MID;
	int size;
	char msg[MAX_MESSAGE];
	PROCESS_ptr nextProcess;
};

static MBOX      MBOX_ARRAY[MAXMBOX];
static MSLOT     MSLOT_ARRAY[MAXSLOTS];
static PROCESS   PROCESS_TABLE[MAXPROC];

void (*systemCallVec[])(systemArgs *args);


/* required functions */
void phase2_start_service_processes(void);
int  phase2_check_io(void);
void phase2_clockHandler(void);
static void nullsys(systemArgs *args);
// interupt handlers
void clockHandler(int device, void* unit);
void terminalHandler(int device, void* unit);
void diskHandler(int device, void* unit);
void syscallHandler(int device, void* unit);
/* 					    */


/* additional functions */
bool inKernelMode();
void disableInterrupts();
void enableInterrupts();
int  sendByCond(int mailboxID, void *message, int messageSize, bool cond);
int  getSlot();
int  recvByCond(int mailboxID, void *message, int messageSize, bool cond);
void freeTheSlot(int mbox_id);
/*   				    */

/**
 * 
 * 	Setting up data structure
 * 
 **/
void phase2_init(void){
	inKernelMode();
	//disableInterrupts();


	// initialize MBOX_ARRAY
	int i;
	for (i=0; i<MAXMBOX; i++){
		MBOX_ARRAY[i].MID           = i;
		MBOX_ARRAY[i].status        = EMPTY;
		MBOX_ARRAY[i].slotHead      = NULL;
		MBOX_ARRAY[i].slotTail      = NULL;
		MBOX_ARRAY[i].numSlots      = -1;
		MBOX_ARRAY[i].numSlotsUsed  = -1;
		MBOX_ARRAY[i].slotSize      = -1;
		MBOX_ARRAY[i].consumerWaitList = NULL;
		MBOX_ARRAY[i].producerWaitList = NULL;
	}

	
	// // 2 disk, 4 terminal and a clock will occupy the first 7 mail box
	MboxCreate(1, sizeof(int));    // 0 - clock
	MboxCreate(1, sizeof(int));	   // 1 - terminal 1
	MboxCreate(1, sizeof(int));    // 2 - terminal 2
	MboxCreate(1, sizeof(int));    // 3 - terminal 3
	MboxCreate(1, sizeof(int));    // 4 - terminal 4
	MboxCreate(1, sizeof(int));    // 5 - disk 1
	MboxCreate(1, sizeof(int));    // 6 - disk 2


    USLOSS_IntVec[USLOSS_CLOCK_INT] = clockHandler;
    USLOSS_IntVec[USLOSS_DISK_INT] = diskHandler;
    USLOSS_IntVec[USLOSS_TERM_INT] = terminalHandler;
    USLOSS_IntVec[USLOSS_SYSCALL_INT] = syscallHandler;

	// initialize MSLOT_ARRAY
	int k;
	for (k=0; k<MAXSLOTS; k++){
		MSLOT_ARRAY[k].MID     = -1;
		MSLOT_ARRAY[k].status   = EMPTY;
		memset(MSLOT_ARRAY[k].msg, 0, MAX_MESSAGE);
		MSLOT_ARRAY[k].nextSlot = NULL;
		MSLOT_ARRAY[k].size     = -1;
	}
	
	// initialize PROCESS_TABLE

	for (i=0; i<MAXPROC; i++){
		PROCESS_TABLE[i].pid = -1;
		PROCESS_TABLE[i].blockStatus = -1;
		PROCESS_TABLE[i].MID = -1;
		PROCESS_TABLE[i].size = -1;
		memset(PROCESS_TABLE[i].msg, 0, MAX_MESSAGE);
		PROCESS_TABLE[i].nextProcess = NULL;
	}


	// set all of the elements of systemCallVec[] to nullsys
	for (i=0; i<MAXSYSCALLS; i++){
		systemCallVec[i] = nullsys;
	}
	//enableInterrupts();
}


/**
 * 
 * 	Create Mail Box
 * 
 **/
int MboxCreate(int slots, int slot_size){
	inKernelMode();
	//disableInterrupts();

	if (slots < 0){
	//	USLOSS_Console("ERROR: slots is negative\n");
		enableInterrupts();
		return -1;
	}
	if (slot_size < 0){
	//	USLOSS_Console("ERROR: slot_size is negative\n");
		enableInterrupts();
		return -1;
	}
	if (slots > MAXSLOTS){
	//	USLOSS_Console("ERROR: slots is larger than allowed\n");
		enableInterrupts();
		return -1;
	}
	if (slot_size > MAX_MESSAGE){
	//	USLOSS_Console("ERROR: slot_size is larger than allowed\n");
		enableInterrupts();
		return -1;
	}

	int i;
	for (i=0; i<MAXMBOX; i++){
		// add is for test 25
		if (MBOX_ARRAY[i].status == EMPTY || MBOX_ARRAY[i].status == DESTROYED){
			break;
		}
	}
	if (i == MAXMBOX){
		//USLOSS_Console("ERROR: there are no mailboxes available.\n");
		enableInterrupts();
		return -1;
	}

	MBOX_ARRAY[i].MID          = i;
	MBOX_ARRAY[i].status       = OCCUPY;
	MBOX_ARRAY[i].slotHead	   = NULL;
	MBOX_ARRAY[i].slotTail	   = NULL;
	MBOX_ARRAY[i].numSlots     = slots;
	MBOX_ARRAY[i].numSlotsUsed = 0;
	MBOX_ARRAY[i].slotSize     = slot_size;
	MBOX_ARRAY[i].consumerWaitList = NULL;
	MBOX_ARRAY[i].producerWaitList = NULL;


	//enableInterrupts();
	return MBOX_ARRAY[i].MID;
}


/**
 * 
 * 	Release Mail Box
 * 
 **/
int MboxRelease(int mbox_id){
	inKernelMode();

	disableInterrupts();
	// see pdf 13.2
	if (MBOX_ARRAY[mbox_id].status == EMPTY){
		USLOSS_Console("ERROR: The ID is not a mailbox that is currently in use.\n");
		return -1;
	}

	MBOX_ptr mbox = &MBOX_ARRAY[mbox_id];
	
	mbox->MID   = -1;
	mbox->status = DESTROYED;
	/**
	 * 
	 *  Guess: 
	 * 		  going to do - simply destroy all the slot, consumer wait list and producer wait list for now
	 * 
	 * */


	mbox->numSlots = -1;
	mbox->numSlotsUsed = -1;
	mbox->slotSize = -1;

	MSLOT_ptr slot = mbox->slotHead;

	// free the slots in the mail box
	while (slot != NULL){

		slot->MID = -1;
		slot->status = EMPTY; // tell the slots array that it free
		memset(slot->msg, 0, MAX_MESSAGE);
		slot->size = -1;

		MSLOT_ptr temp = slot->nextSlot;
		slot->nextSlot = NULL;
		slot           = temp;
	}
	mbox->slotTail     = NULL;

	
	// check the block processes and uncblock them
	// free consumber list and producer list

	PROCESS_ptr consumer = mbox->consumerWaitList;
	// check consumer wait list
	while (consumer != NULL){
		consumer->blockStatus = DESTROYED;
		consumer->MID         = -1;
		consumer->size        = -1;
		memset(consumer->msg, 0, MAX_MESSAGE);
		unblockProc(consumer->pid);
		consumer = consumer->nextProcess;
	}

	PROCESS_ptr producer = mbox->producerWaitList;
	while (producer != NULL){
		producer->blockStatus = DESTROYED;
		producer->MID         = -1;
		producer->size        = -1;
		memset(producer->msg, 0, MAX_MESSAGE);
		unblockProc(producer->pid);
		producer = producer->nextProcess;
	}

	if (isZapped() == 1){return -3;}

	enableInterrupts();
	return 0;
}

/**
 * 
 * 	Send msg to mail box
 * 
 **/
int MboxSend(int mbox_id, void *msg_ptr, int msg_size){
	inKernelMode();
	int retVal = sendByCond(mbox_id, msg_ptr, msg_size, COND_FALSE);
	return retVal;
}
/**
 * 
 * 	Receive msg from mail box
 * 
 **/
int MboxReceive(int mbox_id, void *msg_ptr, int msg_max_size){
	inKernelMode();
	int retVal = recvByCond(mbox_id, msg_ptr, msg_max_size, COND_FALSE);
	return retVal;
}
/**
 * 
 * 	Conditinaly Send msg to mail box
 * 
 **/
int MboxCondSend(int mbox_id, void *msg_ptr, int msg_size){
	int retVal = sendByCond(mbox_id, msg_ptr, msg_size, COND_TRUE);
	return retVal;
}
/**
 * 
 * 	Conditinaly Receive msg to mail box
 * 
 **/
int MboxCondReceive(int mbox_id, void *msg_ptr, int msg_max_size){
	inKernelMode();
	int retVal = recvByCond(mbox_id, msg_ptr, msg_max_size, COND_TRUE);
	return retVal;
}
// type = interrupt device type, unit = # of device (when more than one),
// status = where interrupt handler puts device's status register.
int waitDevice(int type, int unit, int *status){

	// type = : clock, disk, or terminal
	// unit - which “unit” of a given type you are accessing a NULL pointer is permissible.
	inKernelMode();

/**
 * 
	typedef struct systemArgs
	{
	        int number; indicate which system call is being requested

	        Below arguments will also be used for returning results to the caller.

	        void *arg1;
	        void *arg2;
	        void *arg3;
	        void *arg4;
	        void *arg5;
	} systemArgs;

**/
	return 0;
}

/* 		required functions 		*/
void phase2_start_service_processes(){
}

/*
	 called by sentinel
*/
int  phase2_check_io(){

    for (int i = 0; i < 7; i++) { 
        if (PROCESS_TABLE[i].blockStatus != EMPTY) {
            return 1;
        }
    }
	return 1;
}

/*
	 called by the clock interrupt handler
*/
void phase2_clockHandler(){
}

static void nullsys(systemArgs* args){
//	USLOSS_Console("ERROR: invalid system call\n");
	USLOSS_Halt(1);
}
void clockHandler(int device, void* unit){

}
//void clockInterruptHandler(int device, void* unit){};
void terminalHandler(int device, void* unit){
//	int unitNo = (int)(long)unit;
};
void diskHandler(int device, void* unit){
//	int unitNo = (int)(long)unit;
};
void syscallHandler(int device, void* unit){};

/* 								*/



/* additional functions */

/*
	check if in kernel mode
*/
bool inKernelMode(){
	 if((USLOSS_PSR_CURRENT_MODE & USLOSS_PsrGet()) == 0){

	 	USLOSS_Halt(1);
	 }
	return true;
}
/*
	disable Interrupts
*/
void disableInterrupts(){
	int retVal = USLOSS_PsrSet( USLOSS_PsrGet() & ~USLOSS_PSR_CURRENT_INT );
	retVal += 1;// 
}
/*
	enable Interrupts
*/
void enableInterrupts(){
	int retVal = USLOSS_PsrSet(USLOSS_PsrGet() | USLOSS_PSR_CURRENT_INT);
	retVal += 1;
}
/*
	helper function for MboxSend nad MboxCondSend
*/
int  sendByCond(int mbox_id, void *msg_ptr, int msg_size, bool cond){
	//USLOSS_Console("========  msg ======== : %s\n", msg_ptr);
	inKernelMode();
	disableInterrupts();


	if (mbox_id < 0 || mbox_id >= MAXMBOX || MBOX_ARRAY[mbox_id].status == EMPTY || MBOX_ARRAY[mbox_id].slotSize < msg_size){
		//USLOSS_Console("Send ========  msg ======== > : %s\n", msg_ptr);
		//USLOSS_Console("MBOX_ARRAY[mbox_id].status = %d\n", MBOX_ARRAY[mbox_id].status == EMPTY);
		
		enableInterrupts();
		return -1;
	}
	// get a slot from slot array
	int slotIndex = getSlot();
	// if no slot avaliable in whole system's mail slots, terminate simulation

	/**
	 * 	add for test16
	 * */
	if (cond == COND_TRUE && slotIndex == MAXSLOTS){ 
		return -2;
	}
	if (slotIndex == MAXSLOTS){
		USLOSS_Console("ERRPR: all of the system’s mail slots are in use\n");
		USLOSS_Halt(1);
	 	return -1;
	}
	/*                                 start                                 */
	int pid = getpid();
	int pos = pid % MAXPROC;
	PROCESS_ptr producer = &PROCESS_TABLE[pos];

	producer->pid = pid;
	producer->blockStatus = NONE_BLOCKED;
	producer->MID = mbox_id;
	producer->size = msg_size;
	memcpy(producer->msg, msg_ptr, msg_size);
	producer->nextProcess = NULL;

	MBOX_ptr mbox = &MBOX_ARRAY[mbox_id];
	/**
	 * 
	 * 	support for zero-slot mailboxes
	 * 	wait, blocking, until a consumer has arrived 
	 * 	for test 10-12
	 **/


	// sender
	if (mbox->numSlots == 0){

		if (cond == COND_TRUE){enableInterrupts();return -2;}
		// 1. there is a consumer in consumer wait list
		if (mbox->consumerWaitList != NULL){
			//USLOSS_Console("HERE!\n");
			PROCESS_ptr consumer = mbox->consumerWaitList;
			memcpy(consumer->msg, producer->msg, producer->size);
			consumer->size = msg_size; 

			
			unblockProc(consumer->pid);  // error Assertion

			
			enableInterrupts();
			return 0;
		}
		//2.
		else if (mbox->consumerWaitList == NULL){
			if (mbox->producerWaitList == NULL){
				mbox->producerWaitList = producer;
			}else if (mbox->producerWaitList != NULL){
				PROCESS_ptr temp = mbox->producerWaitList;
				while (temp->nextProcess != NULL){
					temp = temp->nextProcess;
				}
				temp->nextProcess = producer;
			}

		//	USLOSS_Console("Sender block!\n");
			blockMe(PRODUCER_BLOCKED);
			if (mbox->status == DESTROYED){return -3;} // add for test17
		//	USLOSS_Console("Unblock success in sender\n");


			PROCESS_ptr consumer = mbox->consumerWaitList;
			// there will be a consumer unblock it 
			// after a consumer call unblockProc(pid), it will jump to this line than after return go back to itself
			memcpy(consumer->msg, producer->msg, producer->size);
			consumer->size = msg_size; 

			// after all done move forward
			mbox->producerWaitList = producer->nextProcess;
			mbox->consumerWaitList = consumer->nextProcess;

		//	USLOSS_Console("Sender DONE\n");
			enableInterrupts();
			return 0;
		}


	}

	// 1. consumer at wait list
	if (mbox->consumerWaitList != NULL){
		PROCESS_ptr consumer = mbox->consumerWaitList;
		// if (producer->size > consumer->size){

		// 	USLOSS_Console("producer size = %d, the function msg szie = %d\n", producer->size, msg_size);
		// 	USLOSS_Console("consumer size = %d\n", consumer->size);

		// 	enableInterrupts();
		// 	return -1;
		// } // sender msg size > than receiver msg size, can't send to it


		memcpy(consumer->msg, producer->msg, producer->size);
		consumer->size = msg_size;
	//	USLOSS_Console("HERE\n"); test 23 error
		unblockProc(consumer->pid); // awake consumer

		// this two solve for test23 error
		mbox->producerWaitList = producer->nextProcess;
		mbox->consumerWaitList = consumer->nextProcess;
		// 

		enableInterrupts();
		return 0; // whichi is success
	}
	// 2. mbox is full, move prodeucer to wait list, FIFO
	if (mbox->numSlots == mbox->numSlotsUsed){
		/**
		 * 
		 * 	For MboxCondSend() to pass test10.c
		 * 
		 **/
		if (cond == COND_TRUE){enableInterrupts();return -2;}

		if (mbox->producerWaitList == NULL){
			mbox->producerWaitList = producer;
		}else{
			// move to tail
			PROCESS_ptr temp = mbox->producerWaitList;
			while (temp->nextProcess != NULL){
				temp = temp->nextProcess;
			}
			temp->nextProcess = producer;
		}
		/**
		 * 	Not sure if after unblack the process will come back in order
		 *  for now the solution is to unblack the first in producer wait lsit
		 * 
		 **/
		// block producer until slot avaliable // may be implement in recv()
		blockMe(PRODUCER_BLOCKED);
		/**
		 * 	check if it's released or not
		 * 	the if statement solved test08.c
		 * */
		if (mbox->status == DESTROYED){
			enableInterrupts();
			return -3;
		}

		// re-get the slot index
		slotIndex = getSlot();
	}
	// 3. simply put the msg into slot, be sure to check if the array if avaliable or not

	// get slot
	MSLOT_ptr slot = &MSLOT_ARRAY[slotIndex];
	slot->MID     = mbox_id;
	slot->status   = OCCUPY;
	memcpy(slot->msg, producer->msg, producer->size);
	slot->nextSlot = NULL;
	// not sure yet, for now just indicates the slot's msg size
	slot->size     = msg_size;

	// place slot into the mail box
	if (mbox->slotHead == NULL){
		mbox->slotHead = slot;
		mbox->slotTail = slot;
	}else{
		mbox->slotTail->nextSlot = slot;
		mbox->slotTail = mbox->slotTail->nextSlot;
	}
	mbox->numSlotsUsed += 1;

	enableInterrupts();
	return 0;
}
/*
	helper function for MboxRecv nad MboxCondRecv
*/
int  recvByCond(int mbox_id, void *msg_ptr, int msg_max_size, bool cond){
	inKernelMode();
	disableInterrupts();

	// TODO: should be revise test20
	if (MBOX_ARRAY[mbox_id].status == DESTROYED){
		enableInterrupts();
		return -1;
	}
	// check this
	// msg_max_size > MBOX_ARRAY[mbox_id].slotSize 
	if (mbox_id < 0 || mbox_id >= MAXMBOX || MBOX_ARRAY[mbox_id].status == EMPTY){
		enableInterrupts();
		return -1;
	}
	int msgSize = -1;

	// store process to process table
	int pid = getpid();
	int pos = pid % MAXPROC;
	PROCESS_ptr consumer = &PROCESS_TABLE[pos];

	consumer->pid = pid;
	consumer->blockStatus = NONE_BLOCKED;
	consumer->MID = mbox_id;
	consumer->size = msg_max_size;
	// sonsumer->msg should not be write yet
	consumer->nextProcess = NULL;

	MBOX_ptr mbox = &MBOX_ARRAY[mbox_id];
	/**
	 * 
	 * 	support for zero-slot mailboxes
	 * 	wait, blocking, until a producer has arrived 
	 *  for test 10-12
	 * 	
	 * // sol2: no matter what put consumer into wait list then see what happen
	 **/

	// receiver
	if (mbox->numSlots == 0){

		if (cond == COND_TRUE){enableInterrupts();return -2;}

		// implement sol2
		if (mbox->consumerWaitList == NULL){
			mbox->consumerWaitList = consumer;
		}else{
			PROCESS_ptr temp = mbox->consumerWaitList;
			while (temp->nextProcess != NULL){
				temp = temp->nextProcess;
			}
			temp->nextProcess = consumer;
		}

		// re-get the accurate consumer
		consumer = mbox->consumerWaitList;

		// there is a producer in producer wait list
		if (mbox->producerWaitList != NULL){
			PROCESS_ptr producer = mbox->producerWaitList;
		//	USLOSS_Console("Starting to unblock producer\n");
			unblockProc(producer->pid);
		//	USLOSS_Console("Unblock success\n");

			msgSize = consumer->size;
			memcpy(msg_ptr, consumer->msg, consumer->size);
			// after all done, move forward
		//	mbox->consumerWaitList = consumer->nextProcess; 

		//c	USLOSS_Console("Consumer Move Forward success\n");
			enableInterrupts();
			return msgSize;
		}
		else if (mbox->producerWaitList == NULL){

			// it already in the consumer wait list
			blockMe(CONSUMER_BLOCKED);

			if (mbox->status == DESTROYED || isZapped()){
	 			//USLOSS_Console("=======  HERE =======\n");
	 			enableInterrupts();
	 			return -3;
	 		}

			msgSize = consumer->size;
			memcpy(msg_ptr, consumer->msg, consumer->size);
			mbox->consumerWaitList = consumer->nextProcess; 
			enableInterrupts();
			return msgSize;
		}
	}


	// 1. if the mail box has slots avaliable, that is it will not be put into consumer wait list
	if (mbox->numSlots >= mbox->numSlotsUsed && mbox->numSlotsUsed != 0){
		// which means the mail box is has msg in the slots or the mail box is still empty
		// bool isFull = false;
		// if (mbox->numSlots == mbox->numSlotsUsed){
		// 	isFull = true;
		// }

		MSLOT_ptr slot = mbox->slotHead;
		msgSize    = slot->size;
		if (msgSize > msg_max_size){enableInterrupts();return -1;} // can not get because the size is greather than the 
		memcpy(msg_ptr, slot->msg, msg_max_size);
		freeTheSlot(mbox_id);

		/**
		 * 	Because detects the mail box just free a slot from full slots
		 * 	it should notify producer wait list to unblock if there is someone wiat for it
		 * */
		if (mbox->producerWaitList != NULL){
			// which means we should wake it up (see Line around 320)
			PROCESS_ptr producer = mbox->producerWaitList;				  // get the producer process
			mbox->producerWaitList = mbox->producerWaitList->nextProcess; // move to next producer in order

			// Not sure do we need to clean the process table
			// after we unblock the process, it will put msg into the slot that just be freed 
			unblockProc(producer->pid);
		}

		enableInterrupts();
		return msgSize;
	}

	// 2. if the mail box currently is no msgs and empty, for now we over call recv 
	if (mbox->numSlotsUsed == 0){
		// which means that we should add consumer to consumer wait list to get the first msg

		/**
		 * 
		 *  For MboxCondReceive() to pass test10.c
		 * 
		 **/
		if (cond == COND_TRUE){enableInterrupts();return -2;}

		// if the mail box's consumer wait list is not NULL
		if (mbox->consumerWaitList == NULL){
			mbox->consumerWaitList = consumer;
		}else{
			PROCESS_ptr temp = mbox->consumerWaitList;
			while (temp->nextProcess != NULL){
				temp = temp->nextProcess;
			}
			temp->nextProcess = consumer;
		}
		/**
		 * 
		 * Block me! see Line 293
		 **/
	//	USLOSS_Console("HERE\n"); // test40
		blockMe(CONSUMER_BLOCKED);
		
		// test40
		if (consumer->size > msg_max_size){
			return -1;
		}
		/**
		 *  the if statement solved test08.c
		 *  
		 * */
		if (mbox->status == DESTROYED){
			enableInterrupts();
			return -3;
		}


		if (isZapped() == 1){enableInterrupts();return -3;}
		// should be update after be awake
		msgSize = consumer->size;
		memcpy(msg_ptr, consumer->msg, consumer->size);
		
		///
	//	mbox->consumerWaitList = consumer->nextProcess;

		///

		enableInterrupts();
		return msgSize;

	}


	enableInterrupts();
	return msgSize;
}

/*

	get a free slot from slot table

*/
int getSlot(){
	int slot;
	for (slot=0; slot<MAXSLOTS; slot++){
		if(MSLOT_ARRAY[slot].status == EMPTY){
			break;
		}
	}
	return slot;
}
/*

	free a slot from slot table by mail box id

*/
void freeTheSlot(int mbox_id){

	MSLOT *slot = MBOX_ARRAY[mbox_id].slotHead;

	// modify the mail box
	MBOX_ARRAY[mbox_id].numSlotsUsed -= 1;
	// if the mail box become empty, update the info
	if (MBOX_ARRAY[mbox_id].numSlotsUsed == 0){
		MBOX_ARRAY[mbox_id].status   = OCCUPY; 
		// still occupy because the mail box still can be used as it created status
		// sthis modified as a bug in my init setting, but I change it to sloved test11.c
		MBOX_ARRAY[mbox_id].slotHead = NULL;
		MBOX_ARRAY[mbox_id].slotTail = NULL;
	}else{
		MBOX_ARRAY[mbox_id].slotHead = MBOX_ARRAY[mbox_id].slotHead->nextSlot;
	}

	// clean the slot
	slot->MID     = -1;
	slot->status   = EMPTY;
	slot->nextSlot = NULL;
	memset(slot->msg, 0, MAX_MESSAGE);
	slot->size     = -1;

}



