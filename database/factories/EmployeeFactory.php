<?php

namespace Database\Factories;

use App\Models\Employee;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class EmployeeFactory extends Factory
{
    protected $model = Employee::class;

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
