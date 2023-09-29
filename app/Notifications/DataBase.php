<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Events\StatusLiked;

class DataBase extends Notification
{
    public $user;
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //$this->user = $user;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database','broadcast'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toDataBase(object $notifiable): array
    {
        return [
            //'name' => $this->user->name,
            'message'=>'This is the data saved in the db',
            'url'=>'/'
        ];
    }
    public function toBroadcast(object $notifiable)
    {
        //return  new BroadcastMessage($this->toDataBase($notifiable));
        return  new StatusLiked($this->toDataBase($notifiable));
        /*return new BroadcastMessage([
            'message'=>'This is the data saved in the db'
        ]);*/
    }
}
