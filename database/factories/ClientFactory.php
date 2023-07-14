<?php

namespace Database\Factories;

use App\Models\Client;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class ClientFactory extends Factory
{
    protected $model = Client::class;

    public function definition()
    {
        return [
			'name' => $this->faker->name,
			'due' => $this->faker->name,
			'comments' => $this->faker->name,
			'image' => $this->faker->name,
        ];
    }
}
