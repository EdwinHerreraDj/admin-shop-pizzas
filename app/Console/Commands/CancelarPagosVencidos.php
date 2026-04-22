<?php

namespace App\Console\Commands;

use App\Models\Pedido;
use Illuminate\Console\Command;

class CancelarPagosVencidos extends Command
{
    protected $signature = 'pedidos:cancelar-pagos-vencidos {--minutos=30}';

    protected $description = 'Cancela los pedidos con pago por tarjeta que llevan más de N minutos en pendiente_pago sin confirmación de Redsys.';

    public function handle(): int
    {
        $minutos = (int) $this->option('minutos');
        $limite  = now()->subMinutes($minutos);

        $pedidos = Pedido::where('estado', 'pendiente_pago')
            ->where('estado_pago', 'pendiente')
            ->where('created_at', '<', $limite)
            ->get();

        foreach ($pedidos as $pedido) {
            $pedido->estado      = 'cancelado';
            $pedido->estado_pago = 'fallido';
            $pedido->save();

            $this->info("Cancelado pedido {$pedido->codigo} (ds_order={$pedido->ds_order})");
        }

        $this->info("Total cancelados: {$pedidos->count()}");

        return self::SUCCESS;
    }
}
