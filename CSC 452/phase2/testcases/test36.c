
/* A simple test of USLOSS_Syscall and sys_vec.  Makes a call to system trap 
 * number 0.  Should cause USLOSS to halt.
 */

#include <stdio.h>
#include <usloss.h>
#include <phase1.h>
#include <phase2.h>

extern void USLOSS_Syscall(void *arg);



void enableUserMode(){
    int result;

    result = USLOSS_PsrSet( USLOSS_PsrGet() & (~ USLOSS_PSR_CURRENT_MODE) );
    if ( result != USLOSS_DEV_OK ) {
        USLOSS_Console("enableUserMode(): USLOSS_PsrSet returned %d ", result);
        USLOSS_Console("Halting...\n");
        USLOSS_Halt(1);
    }
}



int start2(char *arg)
{
    systemArgs args;

    USLOSS_Console("start2(): putting itself into user mode\n");
    enableUserMode();

    USLOSS_Console("start2(): calling USLOSS_Syscall executing syscall 0, this should halt\n");

    args.number=0;
    USLOSS_Syscall((void *)&args);

    USLOSS_Console("start2(): ERROR ERROR ERROR should not see this message!\n");

    return 0; /* so gcc will not complain about its absence... */
}

