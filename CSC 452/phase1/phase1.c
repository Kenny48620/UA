/*
 	Program: Phase1.c
 	Course:  CSC 452
 	Author:  Kaichun Lee, Roberto Wong
*/
#include <phase1.h>
#include <usloss.h>

#include <string.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdbool.h>

#define EMPTY   0
#define READY   1
#define BLOCKED 2
#define QUIT	3
#define JOINBLOCKED	   4
#define RUNNING 5
#define ZAPPED  6
#define ZAPPEDBLOCKED  7

#define TESTCASE_MAIN_PRIORITY 5
#define INIT_PRIORITY          6
#define SENTINEL_PRIORITY      7

#define TIMIELIMITED 80000

#define TRUE  1
#define FALSE 0

bool DEBUG = false;

typedef struct process  proc;
typedef struct process* procPtr;

typedef struct list  list;
typedef struct list* listPtr;

struct process{
	/*	intuitive  variables*/
	int  pid;						
	int  ppid;
	int  status;
	char name[MAXNAME];
	int (* startFunc) (char *); 
	char arg[MAXNAME];
	int  stackSize;
	char *stack;
	int priority;

	USLOSS_Context context;
	/*	addtional variables*/
	int quitStatus;

	procPtr firstChild;  	 	// first child of current process
	procPtr nextSibling;		// point to next sibiling
	procPtr quitChild;   		// the child process that has already quit
	int		quitListSize;		// record the number of quit children
	procPtr parentProc;  		// parent process of current process

	int startTime;				// start time of current process
	int cpuTime;				// total CPU time consume

	/*	for zap */
	listPtr  zapCallers; 		// zap callers
	int 	 zapcallersSize;	// record the number of zap caller 
	int		 isZapped;			// check is zpped or not
};


struct list{
	procPtr proc;
	listPtr next;
};

/* function prototypes*/
int init(char*);		 // the initial process
int sentinel(char*);
int disableInterrupt();
void restoreInterrupt(int);
void checkKernelMode(char*);
int  getSlot();
void dispatcher();
void trampoline();
static void clockHandler(int ,void*);
int testcase_mainWrapper(char*);
void addToReadyList(procPtr);
void displayReadyList();
void removeFromReadyList();
void addChild(procPtr);

void addQuitToParent(procPtr);
void displayQuitList(procPtr);
// haven't done remove quit list

void removeFromBlockedList(procPtr);
void removeChild(procPtr);
void displayChildList();
int  currentTime();
void enableInterrupt();

// for zap()
void wakeZapCallers();
void addToZapCallers(procPtr);

/* global variable*/
proc    procTable[MAXPROC];
procPtr curProc;
int     nextPid;
int 	psr_save;
listPtr readyList;
/*
	Initializes the data structures.
*/
void  phase1_init(){

	int i;
	// initialize process table
	for (i=0; i<MAXPROC; i++){
		procTable[i].pid       = -1;
		procTable[i].ppid      = -1;
		procTable[i].status    = EMPTY;
		memset(procTable[i].name, 0, MAXNAME);
		procTable[i].startFunc = NULL;
		memset(procTable[i].arg, 0, MAXARG);
		procTable[i].stackSize = -1;
		procTable[i].stack = NULL;
		procTable[i].priority  = -1;

		// aditional variables
		procTable[i].quitStatus   = -1;
		procTable[i].firstChild   = NULL;   // first child of current process
		procTable[i].nextSibling  = NULL;   // next sibiling
		procTable[i].quitChild    = NULL;   // quit processs of it child
		procTable[i].quitListSize = -1;	   // quit list size 	
		procTable[i].parentProc   = NULL;   // parent process of current process

		procTable[i].startTime    = -1;
		procTable[i].cpuTime      = -1;

		// for zap
		procTable[i].zapCallers     = NULL;
		procTable[i].zapcallersSize = -1;
		procTable[i].isZapped 		= -1;
	}


	// initialize clock handler
	USLOSS_IntVec[USLOSS_CLOCK_INT] = clockHandler;
	// initialize pid
	nextPid = 0;
	// initialize readylist 
	readyList = NULL;
}

/*
	Once phase1_init done. Calling this process
	startProcesses will call init
*/
void  startProcesses(){
	if (DEBUG){
		USLOSS_Console("startProcesses()...\n");
	}

	// initialize table for init()
	procTable[1].pid       = ++nextPid; // pid = 1 for init()
	procTable[1].ppid      = 0;
	procTable[1].status    = READY;     // Ready to run status
	memcpy(procTable[1].name, "init", sizeof(procTable[1].name));
	procTable[1].startFunc = init;
	memset(procTable[1].arg, 0, MAXARG);// init doesn't have any arguments
	procTable[1].stackSize = USLOSS_MIN_STACK*2;
	procTable[1].stack = (char *) malloc(procTable[1].stackSize);
	procTable[1].priority  = INIT_PRIORITY;

	// initialize process context
	USLOSS_ContextInit(&procTable[1].context, procTable[1].stack, procTable[1].stackSize, NULL, trampoline);

	// put into ready list manually
	listPtr firstProc= (listPtr) malloc(sizeof(list));
	firstProc->proc = &procTable[1];
	firstProc->next = NULL;
	readyList = firstProc;
	
	// call dispatcher for next running process
	dispatcher();
}

/*
	Called by start process. The first process in OS system. It will create two process sentinel and testcase_main.
*/
int init(char* dummy){
	// check if running in kernal mode
	checkKernelMode("init");
	if (DEBUG){
		USLOSS_Console("init() start...\n");
		//USLOSS_Console("pid = %d, getpid() = %d\n", curProc->pid, getpid());
	}
	
	phase2_start_service_processes();
	phase3_start_service_processes();
	phase4_start_service_processes();
	phase5_start_service_processes();

	int childPid, status;

	// craete sentinel process with priority 7
	childPid = fork1("sentinel", sentinel, NULL, USLOSS_MIN_STACK, SENTINEL_PRIORITY);
	if (childPid < 0){
		USLOSS_Console("ERROR: sentinel pid %d < 0\n", childPid);
		USLOSS_Halt(1);
	}

	// create testcase_main process with priority 5
	childPid = fork1("testcase_main", testcase_mainWrapper, NULL, USLOSS_MIN_STACK, TESTCASE_MAIN_PRIORITY);
	if (childPid < 0){
		USLOSS_Console("ERROR: testcase_main pid < 0\n");
		USLOSS_Halt(1);
	}

	/*
		infinite loop with join and join over and over again, cleaning up statuses from any of its children which eventually die
		If all of its children die, it will report an error an halt the simulation.
	*/
	do{
		childPid = join(&status);
	}while(childPid != -2);
	//  have no children left, print out an error message and terminate the simulation.
	USLOSS_Console("Init has no children left, about to terminate the simulation...\n");
	USLOSS_Halt(0);

	return 0;
}

/*
	Create a process as a child of current process
*/
int   fork1(char *name, int(*func)(char *), char *arg, int stacksize, int priority){
	// check if running in kernal mode
	checkKernelMode("fork1");
	// disable interrupt and store psr rate
	
	// ERROR checking
	// check stack size
	if (stacksize < USLOSS_MIN_STACK){
		return -2;
	}
	// check priority range
	if ((func != sentinel && priority > 5) || priority < 1){
		return -1;
	}
	// check startFuc, name and it's length
	if (name == NULL || func == NULL || strlen(name)>MAXNAME){
		return -1;
	}

	int slot;
	// get empty slot
	slot = getSlot();
	if (slot < 0){
		return -1;
	}
	if (DEBUG){
		USLOSS_Console("fork1() %s, pid=%d, slot=%d start...\n", name, nextPid, slot);
	}

	// store process information to process table
	procPtr process 	= &procTable[slot];
	process->pid 		= nextPid;
	process->ppid   	= curProc->pid;
	process->status 	= READY; 	// Ready to run status
	memcpy(process->name, name, sizeof(process->name));
	process->startFunc 	= func;		// function 
	if (arg == NULL){
		process->arg[0] = '\0';
	}else{
		memcpy(process->arg, arg, sizeof(process->arg));
	}
	process->stackSize = stacksize;
	process->stack = (char *) malloc(process->stackSize);
	process->priority  = priority;
	process->quitListSize = 0;

	process->startTime = 0;
	process->cpuTime   = 0;
	// for zap
	process->zapCallers  	= NULL;
	process->zapcallersSize = 0;
	process->isZapped 		= FALSE;
	
	// initialize process context
	USLOSS_ContextInit(&process->context, process->stack, process->stackSize, NULL, trampoline);

	// try to present a block if the fork process has higher priority than current process
	if (process->priority < curProc->priority){
		//1. rmove head
			removeFromReadyList();
		//2. add fork process
			addToReadyList(process);
		//3. add head back
			addToReadyList(curProc);
	}
	else{
		// add the process to ready list
		addToReadyList(process);
	}
	
	// add to childList of current process
	addChild(process);
	// add parent for current process
	process->parentProc = curProc;

	// call dispatcher to decide whcich to run next
	dispatcher();

	return process->pid; 
}

/*
	sentinel process to detect deadlock
*/
int sentinel(char* dummy){
	// check if running in kernal mode
	checkKernelMode("sentinel");
	while (1) {
		if (phase2_check_io() == 0){
			//report deadlock and terminate simulation
			USLOSS_Console("DEADLOCK DETECTED!  All of the processes have blocked, but I/O is not ongoing.\n");
			USLOSS_Halt(1);
		}
		USLOSS_WaitInt();
	}
	return 0;
}

/*
	Wapper for testcase_main();
*/
int testcase_mainWrapper(char *arg){
	testcase_main();
	USLOSS_Halt(1);
	return 1;
}

/*
	Block the current process, until one of its children terminates. 
*/
int   join(int *status){
	// check if running in kernal mode
	checkKernelMode("join");
	// if there is no child in firstChild and no children in quitList, which means  
	// the process does not have any children
	if (curProc->firstChild == NULL && curProc->quitListSize <=0){	
		return -2;
	}
	
	// block the current process until one of its children terminates
	if (curProc->quitListSize <= 0){
		// take it out from ready list(block)
		removeFromReadyList();
		// change the status
		curProc->status = JOINBLOCKED;
		// call dispatcher
		dispatcher();
	}

	/* Below ensure that there is a child in curProc childList */

	procPtr childProc = curProc->quitChild;
	//childProc->status = QUIT; // move the status change from quit()
	int childPid = childProc->pid;
	*status = childProc->quitStatus;

	//childProc->status = EMPTY; UNDO for dumpProcess
	childProc->status = EMPTY;
	curProc->quitListSize--;
	curProc->quitChild = curProc->quitChild->quitChild; // may have NULL error seg fault

	return childPid;
}
/*
	Terminates the current process; it will never run again	
*/
void  quit(int status){
	// check if running in kernal mode
	checkKernelMode("quit");

	//  If a process calls quit() while it still has children (either alive, or dead but un-join()ed), 
	//  print an error message, and terminate it
	//  the reason doesn't use curProc->quitChild != NUll because haven't implement removeQuitList()
	//  so use an easy way to check but doesn't clean the list
	//  if use (curProc->firstChild != NULL || curProc->quitChild != NULL) casue erro
	if (curProc->firstChild != NULL || curProc->quitListSize > 0){		
		USLOSS_Console("ERROR: Process pid %d called quit() while it still had children.\n", curProc->pid);
		USLOSS_Halt(1);
	}
	
	// finsih the task, so remvoe from ready list
	removeFromReadyList();

	// clean process table
	/*	below clean process may need to move to join() */
	//proc->pid    = -1;
	//proc->ppid   = -1;
	curProc->status = QUIT; // 
	//memset(proc->name, 0, MAXNAME);
	curProc->startFunc = NULL;
	// memset(proc->arg, 0, MAXARG); uncomment this line will cause all child priority to be 0 in dumpProcess
	// use proc->arg[0] = '\0' instead
	curProc->arg[0] = '\0';
	
	curProc->stackSize = -1;
	curProc->stack = NULL;
	//proc->priority  = -1; 

	//store the quit status of the process
	curProc->quitStatus = status;

	// add quit information for parent
	addQuitToParent(curProc);
	
	//remove child for parent, But doesn't disconnect proc->parent.
	removeChild(curProc);

	// check if the parent is waiting for unblock, add it back to ready list
	if (curProc->parentProc->status == JOINBLOCKED){
		addToReadyList(curProc->parentProc);
		curProc->parentProc->status = READY;
	}
	// check if there is any zap caller who is waiting to be waked up
	if (curProc->zapcallersSize > 0){
	    // wake all 
		wakeZapCallers();
	}

	// call dispatcher to run next process
	dispatcher();
}
/*
	Requests that another process terminate. However, the process is not automatically destroyed; it must call quit() on its own.
*/
int   zap(int pid){
	// check if running in kernal mode
	checkKernelMode("zap");
	procPtr zappedProc;

	// halt if trying to zap init which is pid 1
	if (pid == 1){
		USLOSS_Console("ERROR: Attempt to zap() init.\n");
		USLOSS_Halt(1);
	}
	// halt if trying to zap itself
	if (pid == curProc->pid){
		USLOSS_Console("ERROR: Attempt to zap() itself.\n");
		USLOSS_Halt(1);
	}
	// halt if pid <= 0
	if (pid < 1){
		USLOSS_Console("ERROR: Attempt to zap() a PID which is <=0.  other_pid = 0\n");
		USLOSS_Halt(1);
	}

	// get the process that is gonna be zapped
	zappedProc = &procTable[pid%MAXPROC];

	// Halt if trying to zap a non-existent process (including a process that is still in the process table but has terminated)
	if (zappedProc->pid == EMPTY){
		USLOSS_Console("ERROR: Attempt to zap() a non-existent process.\n");
		USLOSS_Halt(1);
	}
	if (zappedProc->pid != pid){
		USLOSS_Console("ERROR: Attempt to zap() a non-existent process.\n");
		USLOSS_Halt(1);		
	}
	if (zappedProc->status == QUIT){
		USLOSS_Console("ERROR: Attempt to zap() a process that is already in the process of dying.\n");
		USLOSS_Halt(1);	
	}

	/* request the process to terminared */

	// remove the current process from the readylist
	removeFromReadyList();
	// change the status of current process to ZAPPEDBLOCKED
	curProc->status = ZAPPEDBLOCKED;
	// change the status of zapped process
	zappedProc->isZapped = TRUE;

	// add the current process to zapped process's zap caller list
	addToZapCallers(zappedProc); // assume in the zap caller curProc is still same 

	// after it blocks itself, call dispatcher for running next process
	dispatcher();

	return 0;
}
/*
	Add curProc to zappedProc's zap caller list
*/
void addToZapCallers(procPtr zappedProc){
	// initialize zap node
	listPtr callerProc= (listPtr) malloc(sizeof(list));
	callerProc->proc = curProc;
	callerProc->next = NULL;

	// connect the tail with the current zap caller list
	callerProc->next = zappedProc->zapCallers;
	// point to the head
	zappedProc->zapCallers = callerProc;
	// increment the caller list size
	zappedProc->zapcallersSize ++;
}

/*
	Wake up all of the callers of current process
*/
void wakeZapCallers(){
	//USLOSS_Console("Start running wakeZapCallers()...\n");
	while (curProc->zapCallers != NULL){
		// add to ready list, which is unblock them
		addToReadyList(curProc->zapCallers->proc);
		// change the status of caller proc from Zap block -> Ready
		curProc->zapCallers->proc->status = READY;
		// move to next blocked caller
		curProc->zapCallers = curProc->zapCallers->next;
		// decrement the caller list size
		curProc->zapcallersSize --;
	}
}

/*
	Checks to see if the current process has been zapped by another process
*/
int   isZapped(void){
	// check if running in kernal mode
	checkKernelMode("isZapped");
	return (curProc->isZapped == TRUE);
}

/*
	Return the pid of current process
*/
int   getpid(void){
	return curProc->pid;
}
/*
	Trampoline function for start function that created in fork1()
*/
void trampoline(){
	if (DEBUG){
		USLOSS_Console("trampoline() start...\n");
		USLOSS_Console("=====================\n");
	}

	enableInterrupt();
	int retVal = curProc->startFunc(curProc->arg);

	if (DEBUG){
		USLOSS_Console("trampoline() end... =====================\n");
	}

	quit(retVal);
}
/*
	Determine which process is gonna to run next
*/
void dispatcher(){
	if (DEBUG){
		USLOSS_Console("Dispatcher() start...\n");
	}
	// check if running in kernal mode
	checkKernelMode("dispatcher");

	// first call for init
	if (curProc == NULL){
		// determine the frist process init which is procTable[0]
		curProc = &procTable[1]; 
		if (DEBUG){
			USLOSS_Console("curProc id = %d\n", getpid());
		}
		USLOSS_ContextSwitch(NULL, &curProc->context);
	}
	else{

		// calculate cpu process time of proces, since each time entering the process recalculate the start time
		// cpu time = cputime(for now) + (current time - process start time(re-set after calling dispatcher)) 
		curProc->cpuTime = readtime() + (currentTime() - readCurStartTime());
		
		// looks if higher priority process is runnable // might be wrong
		procPtr preProc = curProc;
		curProc = readyList->proc;

		// reset any time that a context switch occurs.
		curProc->startTime =  currentTime();
		USLOSS_ContextSwitch(&preProc->context, &curProc->context);
	}

}

/*						Time functions						*/

/*
	Reads the current wall-clock time from the CLOCK device.
*/
int   currentTime(){
	// check if running in kernal mode
	checkKernelMode("currentTime");
	int retVal;

	int usloss_rc = USLOSS_DeviceInput(USLOSS_CLOCK_DEV, 0, &retVal);
	if (usloss_rc != USLOSS_DEV_OK){
		USLOSS_Console("ERROR: Could not read cur time\n");
	}

	return retVal; 	// return microseconds
}

/*
	Returns the time (in microseconds) at which the currently executing process began its current time slice.
	It is reset any time that a context switch occurs.
	It also reset if dispatcher notices that the time slice has expired => new time slice begin
*/
int   readCurStartTime(){
	// check if running in kernal mode
	checkKernelMode("readCurStartTime");
	return curProc->startTime;	// return microseconds
}

/*
	Check to see if the currently executing process has exceeded its time slice;
	If so, it calls the dispatcher. Otherwise, it simply returns.
*/
void  timeSlice(){

	// check if running in kernal mode
	checkKernelMode("timeSlice");
	
	//int psr_save = disableInterrupt();
	int timeslice = currentTime() - readCurStartTime(); 

	// if time slice exceed the TIMIELIMITED, it will switch to anotehr process
	// which is to re-arrange to the end of the queue with the same priority
	if (timeslice > 80000){
		// so firstly remove it from ready lisy because it exceed the TIMIELIMITED
		removeFromReadyList();
		// re-add into ready list depends on it's priority
		addToReadyList(curProc);
		// calling dispatcher to stwich
		dispatcher();
	}

	//restoreInterrupt(psr_save);

	// calling dispatcher
	dispatcher();
}

/*
	Returns the total amount of CPU time (in milliseconds) used by the current process, since it was created.
*/
int   readtime(){
	// check if running in kernal mode
	checkKernelMode("readtime");
	return curProc->cpuTime;	// return microseconds
}

/*              done                  */

static void clockHandler(int dev,void *arg)
{
   // call the dispatcher if the time slice has expired
    timeSlice();
	
    phase2_clockHandler();
}

/*
	The head of ready list will be the highest priority process of process table
	the lower has higher priority. 1 > 2 > 3 > 4 > 5 > 6 > 7
*/
void addToReadyList(procPtr proc){
	// assume ready list wiil no always be NULL
	// so temporary don't code anything here

	// create a node 
	listPtr new   = (listPtr) malloc(sizeof(list));
	new->proc = proc;
	new->next = NULL;

	listPtr cur  = readyList;
	listPtr pre  = NULL;

	// highest
	if (new->proc->priority < cur->proc->priority){
		new->next = cur;
		readyList = new;
	}else{
		// 2->3->5, new = 4
		while (cur != NULL && new->proc->priority >= cur->proc->priority){
			pre = cur;
			cur = cur->next;
		}
		// pre = 3
		// cur = 5
		pre->next = new;
		new->next = cur;
		// 3 -> 4 -> 5

		// test00 same value
		// 2->3->4->(*)->5, new = 4
		// pre = 4
		// cur = 5
		// 4->4->5

		// test01 null
		// 2->3->5, new = 6
		// pre = 5
		// cur = NULL
		// 5->6->NULL

		// test02 two value
		// 5->6, new = 5, 6
		// pre = 5, 6
		// cur = 6, NULL
		// 5->5->6, 6->6->NULLs
	}

}

/*
	Remove process as it done
*/
void removeFromReadyList(){
	// TODO: clearn data
	readyList = readyList->next;
}
/*
	Add child to child list
*/
void addChild(procPtr childProc){
	// if there is no child, add it to child list
	if (curProc->firstChild == NULL){
		curProc->firstChild = childProc;
	}else{
		// find the first child
		procPtr cur = curProc->firstChild;

		// check the sibling
		if (cur->nextSibling == NULL){
			cur->nextSibling = childProc;
		}
		// keep moving to the end of sibling
		else{
			procPtr pre = NULL;
			while (cur != NULL){
				pre = cur;
				cur = cur->nextSibling;
			}
			// add it to the end of sibling list
			pre->nextSibling = childProc;
		}
	}
}

/*
	Remove child to parent
*/
void removeChild(procPtr childProc){
	procPtr parentProc = childProc->parentProc;

	if (parentProc == NULL){
		USLOSS_Console("Find0 \n");
	}
	if (parentProc->firstChild == NULL){
		return;
	}

	// case0 first child = childProc
	if (parentProc->firstChild->pid == childProc->pid){
		// no mather has sibling or no sibling
		parentProc->firstChild = childProc->nextSibling;
		childProc->nextSibling = NULL;
	}
	// case1 childProc in sibling list
	else{
		// no need to move firstChild
		procPtr curSibling = parentProc->firstChild->nextSibling;
		procPtr preSibling = NULL;
		/* There is no need to do if sibling is also null so return  for test17*/
		if (curSibling == NULL){

			return;
		}

		while(curSibling->pid != childProc->pid){ 	// cause seg fault if curSibiling is null
			preSibling = curSibling;
			curSibling = curSibling->nextSibling;
		}
		// first sibling = childProc
		if (preSibling == NULL){
			parentProc->firstChild->nextSibling = parentProc->firstChild->nextSibling->nextSibling;
			childProc->nextSibling = NULL;
		}
		// in the middle
		else{
			preSibling->nextSibling = curSibling->nextSibling;
			childProc->nextSibling = NULL;
		}
	}
}

/*
	Add quit child to parent process
	Warning !! This may cause error cause 
*/
void addQuitToParent(procPtr childProc){
	// get the parent
	procPtr parnetProc = childProc->parentProc;
	
	if (parnetProc->quitChild == NULL){
		parnetProc->quitChild = childProc;
	}else{
		// add to the top of the quit list
		procPtr tmp = parnetProc->quitChild;
		parnetProc->quitChild = childProc;
		childProc->quitChild  = tmp;
	}
	parnetProc->quitListSize ++;
}

/*
	Display quit list
*/
void displayQuitList(procPtr proc){
	USLOSS_Console("\n======================\n");
	USLOSS_Console("Dispay Quit List... ");
	int quitListSize = proc->quitListSize;
	procPtr quitProc = proc->quitChild;
	
	while (quitListSize > 0){
		USLOSS_Console("%s(status=%d) ->", quitProc->name, quitProc->quitStatus);
		quitProc = quitProc->quitChild;
	}
	USLOSS_Console("\n");
}

/*
	Display the children currrent process
*/
void displayChildList(){
	USLOSS_Console("\n======================\n");
	USLOSS_Console("Display child list...\n");
	procPtr cur = curProc;
	USLOSS_Console("%s has children ==> ", curProc->name);
	if (cur->firstChild != NULL){
		USLOSS_Console("First child %s(%d) -> ", cur->firstChild->name, cur->firstChild->pid);
		procPtr curSibling = cur->firstChild->nextSibling;
		while (curSibling != NULL){
			USLOSS_Console("%s(%d)-> ", curSibling->name, curSibling->pid);
			curSibling = curSibling->nextSibling;
		}
	}
	USLOSS_Console("\n======================\n");
}

/*

	Daisable interrupt and save psr rate. 
*/
int disableInterrupt(){
	int retVal;

	psr_save  = USLOSS_PsrGet();
	retVal        = USLOSS_PsrSet(psr_save & ~USLOSS_PSR_CURRENT_INT);
	if (retVal != USLOSS_DEV_OK){
		USLOSS_Halt(1);
	}
	/*
		0010
		1101
		----
		0000

		1010
		1101
		----
		1000
	
	*/
	return psr_save;
}

/*
	Restore interrupt by setting the previous psr rate
*/
void restoreInterrupt(int psr_save){
	//int dummy = USLOSS_PsrSet(USLOSS_PsrGet() | USLOSS_PSR_CURRENT_INT);
	int retVal;
	
	retVal = USLOSS_PsrSet(psr_save);
	if (retVal != USLOSS_DEV_OK){
		USLOSS_Halt(1);
	}

	/*
		0001
        0010
		----
		0011


		1000
		0010
		----
        1010
	*/
}

/*
	Enablie interrupt
*/
void enableInterrupt(){
	//int dummy = USLOSS_PsrSet(USLOSS_PsrGet() | USLOSS_PSR_CURRENT_INT);
	int retVal;
	
	retVal = USLOSS_PsrSet(USLOSS_PsrGet() | USLOSS_PSR_CURRENT_INT);
	if (retVal != USLOSS_DEV_OK){
		USLOSS_Halt(1);
	}

	/*
		0001
        0010
		----
		0011


		1000
		0010
		----
        1010
	*/
}

/*
	Check if running in kernel mode
*/
void checkKernelMode(char* caller){
	// check if in kernel mode, if not terminate
	// kernal mode: 1, user mode:0
	if ((USLOSS_PsrGet() & USLOSS_PSR_CURRENT_MODE) == 0){
		USLOSS_Console("ERROR: Someone attempted to call %s while in user mode!\n", caller);
		USLOSS_Halt(1);
	}
	/*
		0010
	   &0001
	  ------
		0000

		0111
	   &0001
	   -----
		0001
	*/
}

/*
	Find an empty slot 
*/
int  getSlot(){
	int slot, count, temp;

	temp = nextPid;
	count = 0;
	do{
		// if there is no avaliable slot in process table
		if (count > MAXPROC){
			// restore back to the orginal pid
			nextPid = temp;
			return -1;
		}
		nextPid++;
		count++;
		slot = nextPid % MAXPROC;
	}while (procTable[slot].status != EMPTY);
	
	return slot;
}

/*
	Display ready list
*/
void displayReadyList(){
	USLOSS_Console("Ready List status:  ");
	listPtr cur = readyList;
	while (cur != NULL){
		USLOSS_Console("%s(%d) ->", cur->proc->name, cur->proc->priority);
		cur = cur->next;
	}
	USLOSS_Console("\n");
}

/*
	Prints out process infromation from the process table in a human-readable format.
*/
void  dumpProcesses(){
	USLOSS_Console(" PID  PPID  NAME              PRIORITY  STATE\n");
					
	int i;
	for (i=0; i<MAXPROC; i++){
		procPtr proc = &procTable[i];
		if (proc->status == EMPTY){
			continue;
		}
		char status[50];
		if (curProc->pid == proc->pid){
			strcpy(status, "Running");
		}else if (proc->status == READY){
			strcpy(status, "Runnable");
		}
		else if (proc->status == BLOCKED){
			// should add (Number)
			strcpy(status, "Blocked");
		}else if (proc->status == JOINBLOCKED){
			strcpy(status, "Blocked(waiting for child to quit)");
		}else if (proc->status == QUIT){
			char stringPidBuf[10];
			sprintf(stringPidBuf,"%d",proc->quitStatus);
			strcpy(status, "Terminated(");
			strcat(status, stringPidBuf);
			strcat(status, ")");
		}else if (proc->status == ZAPPEDBLOCKED){
			strcpy(status,"Blocked(waiting for zap target to quit)");
		}else{
			char stringPidBuf[10];
			sprintf(stringPidBuf,"%d",proc->status);
			strcpy(status, "Blocked(");
			strcat(status, stringPidBuf);
			strcat(status, ")");
		}
		USLOSS_Console("%4d  %4d  %-17s %-9d %s\n", proc->pid, proc->ppid, proc->name, proc->priority, status);
	}
}

/*
	Blcok the current process. Block_status describes why the process is blocked.
*/
int   blockMe(int block_status){
	// The status should greater than zero
	if (block_status <= 10){
		USLOSS_Halt(1);
	}

	// remove process from ready list
	removeFromReadyList();
	// change the status to block_status
	curProc->status = block_status;

	// call dispatcher to allow OS to switch to some other process
	dispatcher();

	return 0;
}

/*
	Unblocks a process that was previously blocked with blockMe().
*/
int   unblockProc(int pid){

	procPtr proc = &procTable[pid%MAXPROC];

	if (curProc->pid == pid){
		return -2;
	}
	// process not exist
	if (proc->pid != pid){
		return -2;
	}
	// status <= 10, which is Empty or somting others
	if (proc->status <= 10){
		return -2;
	}

	// add to ready list
	addToReadyList(proc);
	// change the status
	proc->status = READY;

	// call dispatcher to allow OS to switch to some other process
	dispatcher();
	return 0;
}