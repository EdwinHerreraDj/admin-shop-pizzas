<?php

namespace App\Listeners;

use App\Models\LoginLog;
use Illuminate\Auth\Events\Logout;

/* Aquí registramos los Logout de los usuarios con se cierra la sesion */

class LogSuccessfulLogout
{
    /**
     * Handle the event.
     *
     * @return void
     */
    public function handle(Logout $event)
    {
        $log = LoginLog::where('user_id', $event->user->id)
            ->whereNull('logged_out_at')
            ->latest()
            ->first();

        if ($log) {
            $log->update([
                'logged_out_at' => now(),
            ]);
        }
    }
}
