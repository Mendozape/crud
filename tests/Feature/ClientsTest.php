<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Foundation\Testing\WithFaker;
use Tests\TestCase;

class ClientsTest extends TestCase
{
    /**
     * A basic feature test example.
     */
    public function test_client_contains_no_empty_data()
    {
        $this->get('/')
            ->assertStatus(200)
            ->assertSee('login');
    }
}
