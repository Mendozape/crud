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
    public function test_index_contains_no_empty_table()
    {
        /*$response = $this->get(uri: '/client');
        $response->assertStatus(302);
        $response->assertSee(value: 'lato');*/
        /*$response->assertViewHas('data', function ($collection) use ($product){
            return $collection->contains($product);
        });*/
        $this->get('/client')
            ->assertStatus(302)
            ->assertSee('lato');
    }
}
