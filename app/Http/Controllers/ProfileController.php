<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class ProfileController extends Controller
{
    /**
     * Update profile information (name, email, photo).
     * This version assumes 'profile_photo_path' is added to the User model's $appends.
     */
    public function updateProfileInformation(Request $request)
    {
        $user = $request->user();

        // 🛑 IMPORTANT: Match Resident's photo storage path in the database field.
        // Residents table field is 'photo'. Users table field is 'profile_photo_path'.
        
        $validator = Validator::make($request->all(), [
            'name'  => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'photo' => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Handle profile photo upload
        if ($request->hasFile('photo')) {

            // 1. Delete existing photo
            if ($user->profile_photo_path) {
                // Resident's style of deleting: Use Storage::delete() on the full path
                // Note: The full path here assumes the DB stores only the filename.
                // If DB stores 'filename.png', the delete must prepend the folder path.
                $deletePath = 'public/images/' . $user->profile_photo_path;
                if (Storage::exists($deletePath)) {
                    Storage::delete($deletePath);
                }
            }

            // 2. Store new file using the Resident's syntax
            $photoFileName = Carbon::now()->timestamp . '.' . $request->photo->extension();
            
            // 🛑 CRITICAL FIX: Use the exact Resident storage syntax to ensure the path is correct
            // This stores the file in storage/app/public/images/
            $request->photo->storeAs('public/images', $photoFileName);
            
            // 3. Update the user model with ONLY the filename (matching Resident's DB schema)
            $user->profile_photo_path = $photoFileName;
        }

        $user->name = $request->input('name');
        $user->email = $request->input('email');
        $user->save();

        // Get a fresh user instance (needed after save)
        $freshUser = $user->fresh();

        // Return the fresh model instance (which now includes 'profile_photo_path' via $appends)
        return response()->json([
            'message' => 'Perfil actualizado correctamente.',
            'user' => $freshUser, 
        ], 200);
    }

    /**
     * Update user password.
     */
    public function updatePassword(Request $request)
    {
        $user = $request->user();

        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'password' => 'required|string|min:3|confirmed',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // Verify current password
        if (!Hash::check($request->input('current_password'), $user->password)) {
            return response()->json([
                'errors' => ['current_password' => ['The current password is incorrect.']],
            ], 422);
        }

        // Save new password
        $user->password = Hash::make($request->input('password'));
        $user->save();

        return response()->json(['message' => 'Password updated successfully.'], 200);
    }
}