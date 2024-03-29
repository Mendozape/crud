<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmployeesUpdatedNotification extends Notification
{
    use Queueable;
    public $username,$NumNoti,$unread;
    /**
     * Create a new notification instance.
     */
    public function __construct($event)
    {
        $this->username = $event->EmployeeName;
        $this->NumNoti = $event->NumNoti;
        $this->unread = $event->unread;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toDataBase(object $notifiable): array
    {
        return [
            'name' => $this->username,
            'message'=>'Has just been created:'.$this->NumNoti,
            'url'=>'/'
        ];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
