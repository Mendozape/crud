<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class EmployeesUpdatedNotification extends Notification
{
    use Queueable;
    public $username,$NumNoti;
    /**
     * Create a new notification instance.
     */
    public function __construct($employee, $NumNoti)
    {
        $this->username = $employee->name;
        $this->NumNoti = $NumNoti;
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
            'message'=>'Has just been created',
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
