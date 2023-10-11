<?php
namespace App\Events;
use Illuminate\Broadcasting\Channel;
use Illuminate\Queue\SerializesModels;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
class EmployeesUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;
    public $EmployeeName,$NumNoti;

    /**
     * Create a new event instance.
     */
    public function __construct($employee,$NumNoti)
    {
        //$this->EmployeeName = $employee->name;
        $this->EmployeeName = $employee->name;
        $this->NumNoti = $NumNoti;


    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn()
    {
        return new Channel('EmployeesChannel');
    }
    public function broadcastAs()
    {
        return 'EmployeesEvent';
    }
    /*public function broadcastOn()
    {
        return new Channel('my-channel');
    }
    public function broadcastAs()
    {
        return 'my-event';
    }*/
}
