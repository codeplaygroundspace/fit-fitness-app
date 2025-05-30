'use server'

import { supabaseServer } from '@/lib/supabase'
import type { ExerciseWithLabels } from '@/lib/types'

// Update the ExerciseGroup type to include category_id
export type ExerciseGroup = {
  id: number
  name: string
  description: string | null
  image_url: string | null
  body_sec: number
  body_section_name: string | null
  fir_level: number | null
  fir_level_name: string | null
  category_id?: string | null // Allow null value
}

export async function getWarmupExercises(): Promise<ExerciseWithLabels[]> {
  try {
    // First, get the warmup category ID - using ilike for case-insensitive matching
    const { data: categoryData, error: categoryError } = await supabaseServer
      .from('categories')
      .select('id, name')
      .ilike('name', '%warmup%')

    if (categoryError) {
      console.error('Error fetching warmup category:', categoryError)
      return []
    }

    if (!categoryData || categoryData.length === 0) {
      // Get all available categories
      const { data: allCategories } = await supabaseServer
        .from('categories')
        .select('id, name')
      
      return []
    }

    // Use the first category that matches
    const warmupCategoryId = categoryData[0].id

    // Now get all exercises in the warmup category
    const { data: exercises, error: exercisesError } = await supabaseServer
      .from('exercises')
      .select('*')
      .eq('category_id', warmupCategoryId)

    if (exercisesError) {
      console.error('Error fetching warmup exercises:', exercisesError)
      return []
    }

    if (!exercises || exercises.length === 0) {
      // Return placeholder data if no exercises found
      return [
        {
          id: 0,
          name: 'Sample Warmup Exercise',
          image: '/placeholder.svg?height=200&width=300',
          description:
            'This is a placeholder. No actual warmup exercises found in the database.',
          duration: '30',
          reps: '4',
          labels: [],
        },
      ]
    }

    // Map exercises to the format we need
    return exercises.map((exercise) => {
      return {
        id: exercise.id,
        name: exercise.name,
        image: exercise.image_url || '/placeholder.svg?height=200&width=300',
        description: exercise.ex_description || 'No description available',
        duration: exercise.duration || '30',
        reps: exercise.reps || '4',
        labels: [],
      }
    })
  } catch (error) {
    console.error('Unexpected error in getWarmupExercises:', error)
    return []
  }
}

export async function getStretchExercises(): Promise<ExerciseWithLabels[]> {
  try {
    // First, get the stretch category ID
    const { data: categoryData, error: categoryError } = await supabaseServer
      .from('categories')
      .select('id, name')
      .ilike('name', '%stretch%')

    if (categoryError) {
      console.error('Error fetching stretch category:', categoryError)
      return []
    }

    if (!categoryData || categoryData.length === 0) {
      // Get all available categories
      const { data: allCategories } = await supabaseServer
        .from('categories')
        .select('id, name')
      
      return []
    }

    // Use the first category that matches
    const stretchCategoryId = categoryData[0].id

    // Now get all exercises in the stretch category
    const { data: exercises, error: exercisesError } = await supabaseServer
      .from('exercises')
      .select('*')
      .eq('category_id', stretchCategoryId)

    if (exercisesError) {
      console.error('Error fetching stretch exercises:', exercisesError)
      return []
    }

    if (!exercises || exercises.length === 0) {
      // Return placeholder data if no exercises found
      return [
        {
          id: 0,
          name: 'Sample Stretch Exercise',
          image: '/placeholder.svg?height=200&width=300',
          description:
            'This is a placeholder. No actual stretch exercises found in the database.',
          duration: '15-30',
          reps: null,
          labels: [],
        },
      ]
    }

    // Map exercises to the format we need
    return exercises.map((exercise) => {
      // Ensure image_url is properly handled
      let imageUrl = '/placeholder.svg?height=200&width=300'

      if (exercise.image_url) {
        // If it's a valid URL or path, use it
        if (
          exercise.image_url.startsWith('http') ||
          exercise.image_url.startsWith('/')
        ) {
          imageUrl = exercise.image_url
        }
      }

      return {
        id: exercise.id,
        name: exercise.name,
        image: imageUrl,
        description: exercise.ex_description || 'No description available',
        duration: exercise.duration || '15-30', // Default duration for stretches
        reps: exercise.reps || null,
        labels: [],
      }
    })
  } catch (error) {
    console.error('Unexpected error in getStretchExercises:', error)
    return []
  }
}

// Update the getFitExercises function to handle the missing exercise_id column

export async function getWorkoutExercises(): Promise<ExerciseWithLabels[]> {
  try {
    // First, try to get the Workout category ID
    const { data: categoryData, error: categoryError } = await supabaseServer
      .from('categories')
      .select('id, name')
      .ilike('name', '%workout%') // Search for "workout" pattern

    if (categoryError) {
      console.error('Error fetching Workout category:', categoryError)
      return []
    }

    if (!categoryData || categoryData.length === 0) {
      // Get all available categories
      const { data: allCategories } = await supabaseServer
        .from('categories')
        .select('id, name')
      
      return []
    }

    // Use the first category that matches
    const workoutCategoryId = categoryData[0].id

    // Now get all exercises in the Workout category
    const { data: exercises, error: exercisesError } = await supabaseServer
      .from('exercises')
      .select('*')
      .eq('category_id', workoutCategoryId)

    if (exercisesError) {
      console.error('Error fetching Workout exercises:', exercisesError)
      return []
    }

    if (!exercises || exercises.length === 0) {
      // Try to get some exercises as fallback
      const { data: fallbackExercises, error: fallbackError } =
        await supabaseServer.from('exercises').select('*').limit(10)

      if (
        fallbackError ||
        !fallbackExercises ||
        fallbackExercises.length === 0
      ) {
        return [
          {
            id: 0,
            name: 'Sample Workout Exercise',
            image: '/placeholder.svg?height=200&width=300',
            description:
              'This is a placeholder. No Workout exercises found in the database.',
            duration: '60',
            reps: null,
            labels: [],
            categories: ['Sample'],
          },
        ]
      }

      // Map exercises to the format we need
      return fallbackExercises.map((exercise) => ({
        id: exercise.id,
        name: exercise.name,
        image: exercise.image_url || '/placeholder.svg?height=200&width=300',
        description: exercise.ex_description || 'No description available',
        duration: exercise.duration || null,
        reps: exercise.reps || null,
        labels: [],
        categories: getDefaultCategories(exercise.name),
      }))
    }

    // Map exercises to the format we need
    return exercises.map((exercise) => {
      return {
        id: exercise.id,
        name: exercise.name,
        image: exercise.image_url || '/placeholder.svg?height=200&width=300',
        description: exercise.ex_description || 'No description available',
        duration: exercise.duration || null,
        reps: exercise.reps || null,
        labels: [],
        categories: getDefaultCategories(exercise.name),
      }
    })
  } catch (error) {
    console.error('Unexpected error in getWorkoutExercises:', error)
    return []
  }
}

// Update the getExerciseById function to handle the missing exercise_id column

export async function getExerciseById(
  id: number
): Promise<ExerciseWithLabels | undefined> {
  try {
    const { data: exercise, error } = await supabaseServer
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !exercise) {
      console.error('Error fetching exercise:', error)
      return undefined
    }

    // Skip fetching exercise labels since the column doesn't exist
    // Just use default categories
    return {
      id: exercise.id,
      name: exercise.name,
      image: exercise.image_url || '/placeholder.svg?height=200&width=300',
      description: exercise.ex_description,
      duration: exercise.duration || null,
      reps: exercise.reps || null,
      labels: [],
      categories: getDefaultCategories(exercise.name),
    }
  } catch (error) {
    console.error('Error in getExerciseById:', error)
    return undefined
  }
}

// Helper function to assign default categories based on exercise name
function getDefaultCategories(exerciseName: string): string[] {
  const name = exerciseName.toLowerCase()
  const categories: string[] = []

  // Assign body region
  if (
    name.includes('press') ||
    name.includes('pull') ||
    name.includes('overhead')
  ) {
    categories.push('Upper')
  } else if (
    name.includes('thrust') ||
    name.includes('brace') ||
    name.includes('lateral')
  ) {
    categories.push('Middle')
  } else if (
    name.includes('squat') ||
    name.includes('deadlift') ||
    name.includes('raise')
  ) {
    categories.push('Lower')
  }

  // Assign FIR level (just a default)
  categories.push('FIR: Low')

  return categories
}

// Add a function to get exercises by type (to replace getExercisesByType)
export async function getExercisesByType(
  type: 'warmup' | 'stretch' | 'workout'
): Promise<ExerciseWithLabels[]> {
  try {
    // Map the type to the appropriate category name pattern
    let categoryPattern: string
    switch (type) {
      case 'warmup':
        categoryPattern = '%warmup%'
        break
      case 'stretch':
        categoryPattern = '%stretch%'
        break
      case 'workout':
        categoryPattern = '%workout%'
        break
    }

    // Get the category ID
    const { data: categoryData } = await supabaseServer
      .from('categories')
      .select('id')
      .ilike('name', categoryPattern)

    if (!categoryData || categoryData.length === 0) {
      return []
    }

    const categoryId = categoryData[0].id

    // Get exercises in this category
    const { data: exercises, error } = await supabaseServer
      .from('exercises')
      .select('*')
      .eq('category_id', categoryId)

    if (error || !exercises) {
      console.error(`Error fetching ${type} exercises:`, error)
      return []
    }

    // Map to the expected format
    return exercises.map((exercise) => ({
      id: exercise.id,
      name: exercise.name,
      image: exercise.image_url || '/placeholder.svg?height=200&width=300',
      description: exercise.ex_description,
      duration: exercise.duration || null,
      reps: exercise.reps || null,
      labels: [],
      categories: [],
    }))
  } catch (error) {
    console.error(`Error in getExercisesByType for ${type}:`, error)
    return []
  }
}

// Add this new function to fetch exercise groups
export async function getExerciseGroups(): Promise<ExerciseGroup[]> {
  try {
    // Direct SQL approach to ensure we get the proper joins
    const { data, error } = await supabaseServer.rpc('get_exercise_groups_with_details');
    
    if (error) {
      console.error('Error fetching exercise groups with RPC:', error);
      
      // Fallback to regular query with explicit joins
      const { data: fallbackData, error: fallbackError } = await supabaseServer
        .from('exercise_groups')
        .select(`
          id,
          name,
          image_url,
          body_sec,
          fir_level
        `)
        .order('name');
        
      if (fallbackError || !fallbackData) {
        console.error('Error in fallback query:', fallbackError);
        return [];
      }
      
      // Manually get the related data
      const groupIds = fallbackData.map(g => g.id);
      
      // Get the intensity levels
      const { data: firData } = await supabaseServer
        .from('exercise_fir')
        .select('id, name');
        
      // Get the body sections
      const { data: bodySectionData } = await supabaseServer
        .from('exercise_body_section')
        .select('id, body_section');
        
      // Create lookups
      const firMap = (firData || []).reduce((acc, item) => {
        acc[item.id] = item.name;
        return acc;
      }, {} as Record<number, string>);
      
      const bodySectionMap = (bodySectionData || []).reduce((acc, item) => {
        acc[item.id] = item.body_section;
        return acc;
      }, {} as Record<number, string>);
      
      // Map the data
      return fallbackData.map(group => {
        const result = {
          id: group.id,
          name: group.name,
          description: null, // No description column in the database
          image_url: group.image_url,
          body_sec: group.body_sec,
          body_section_name: group.body_sec ? bodySectionMap[group.body_sec] || null : null,
          fir_level: group.fir_level,
          fir_level_name: group.fir_level ? firMap[group.fir_level] || null : null,
          category_id: null // No category_id column in the database
        };
        
        return result;
      });
    }
    
    // If RPC successful, use that data
    return (data || []).map((group: any) => ({
      id: group.id,
      name: group.name,
      description: null, // No description in our database
      image_url: group.image_url,
      body_sec: group.body_sec,
      body_section_name: group.body_section || null,
      fir_level: group.fir_level,
      fir_level_name: group.fir_name || null,
      category_id: null // No category_id in our database
    }));
  } catch (error) {
    console.error('Error in getExerciseGroups:', error)
    return []
  }
}

// Update the getExercisesByGroup function to use the exercise_group column
export async function getExercisesByGroup(
  groupId: number
): Promise<ExerciseWithLabels[]> {
  try {
    // First, get the group details to know what we're looking for
    const { data: group, error: groupError } = await supabaseServer
      .from('exercise_groups')
      .select('*, exercise_body_section!inner(*), exercise_fir!inner(*)')
      .eq('id', groupId)
      .single()

    if (groupError || !group) {
      console.error(`Error fetching group ${groupId}:`, groupError)
      return []
    }

    console.log(`Group data for ${groupId}:`, JSON.stringify(group, null, 2));

    // Primary approach: Use the exercise_group column (this is the correct column name)
    // We need to convert groupId to string since that's how it's stored in the database
    const { data: exercisesByGroup, error: groupError2 } = await supabaseServer
      .from('exercises')
      .select('*')
      .eq('exercise_group', groupId.toString())

    if (!groupError2 && exercisesByGroup && exercisesByGroup.length > 0) {
      // Extract body section and FIR level data properly
      let bodySection = null;
      let firLevel = 'Low';
      
      // Handle multiple possible data structures from Supabase
      if (group.exercise_body_section) {
        if (typeof group.exercise_body_section === 'object') {
          // It could be an array or a single object
          if (Array.isArray(group.exercise_body_section)) {
            bodySection = group.exercise_body_section[0]?.body_section || null;
          } else {
            bodySection = group.exercise_body_section.body_section || null;
          }
        }
      }
      
      // Same for FIR level
      if (group.exercise_fir) {
        if (typeof group.exercise_fir === 'object') {
          if (Array.isArray(group.exercise_fir)) {
            firLevel = group.exercise_fir[0]?.name || 'Low';
          } else {
            firLevel = group.exercise_fir.name || 'Low';
          }
        }
      }
      
      // Fallback for body section using direct property
      if (!bodySection && group.body_sec) {
        // Get body sections directly
        const { data: bodySectionData } = await supabaseServer
          .from('exercise_body_section')
          .select('body_section')
          .eq('id', group.body_sec)
          .single();
        
        if (bodySectionData) {
          bodySection = bodySectionData.body_section;
        }
      }
      
      // Fallback for FIR level using direct property
      if (firLevel === 'Low' && group.fir_level) {
        // Get FIR level directly
        const { data: firData } = await supabaseServer
          .from('exercise_fir')
          .select('name')
          .eq('id', group.fir_level)
          .single();
        
        if (firData) {
          firLevel = firData.name;
        }
      }
      
      console.log(`Group ${groupId} body section: ${bodySection}, FIR level: ${firLevel}`);
      
      // Map to the expected format
      return exercisesByGroup.map((exercise) => {
        // Build categories list
        const categories = [];
        
        // Add body region if available
        if (bodySection) {
          // Capitalize first letter of body section
          categories.push(bodySection.charAt(0).toUpperCase() + bodySection.slice(1));
        } else {
          // Use a default based on the exercise name
          const defaultCategories = getDefaultCategories(exercise.name);
          const bodyRegion = defaultCategories.find(cat => ['Upper', 'Middle', 'Lower'].includes(cat));
          if (bodyRegion) {
            categories.push(bodyRegion);
          }
        }
        
        // Add FIR level - ensure it's in the correct format
        categories.push(`FIR: ${firLevel}`);
        
        console.log(`Exercise ${exercise.id} (${exercise.name}) categories:`, categories);
        
        return {
          id: exercise.id,
          name: exercise.name,
          image: exercise.image_url || '/placeholder.svg?height=200&width=300',
          description: exercise.ex_description,
          duration: exercise.duration || null,
          reps: exercise.reps || null,
          labels: [],
          categories: categories,
        }
      })
    }

    console.log(`No exercises found for group ${groupId}`);
    // If no exercises found with the exact exercise_group, we'll return an empty array
    return []
  } catch (error) {
    console.error(`Error in getExercisesByGroup for ${groupId}:`, error)
    return []
  }
}

// Add this new function to fetch body sections from the database
export async function getBodySections(): Promise<string[]> {
  try {
    const { data, error } = await supabaseServer
      .from('exercise_body_section')
      .select('body_section')
      .order('id', { ascending: true })

    if (error) {
      console.error('Error fetching body sections:', error)
      return ['lower', 'middle', 'upper'] // Fallback order
    }

    if (!data || data.length === 0) {
      return ['lower', 'middle', 'upper'] // Fallback order if no data
    }

    // Extract the body_section values
    return data.map(item => item.body_section)
  } catch (error) {
    console.error('Error in getBodySections:', error)
    return ['lower', 'middle', 'upper'] // Fallback order if error
  }
}
