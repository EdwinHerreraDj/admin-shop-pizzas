<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;

    /**
     * Candado: los traits como RefreshDatabase vacían la BD, así que nunca
     * se ejecutan contra una base que no sea exclusiva de tests.
     */
    protected function setUpTraits()
    {
        $database = config('database.connections.' . config('database.default') . '.database');

        if (! str_ends_with((string) $database, '_testing')) {
            throw new RuntimeException("Tests abortados: la BD '{$database}' no es de tests (debe terminar en _testing).");
        }

        return parent::setUpTraits();
    }
}
