import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('Starting monthly cleanup process...')

    // Initialize Supabase client with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    let deletedFiles = 0
    let deletedRecords = 0

    // 1. Delete all files from visitor-pictures bucket
    console.log('Deleting files from visitor-pictures bucket...')
    const { data: pictureFiles, error: pictureListError } = await supabase.storage
      .from('visitor-pictures')
      .list()

    if (pictureListError) {
      console.error('Error listing picture files:', pictureListError)
    } else if (pictureFiles && pictureFiles.length > 0) {
      const pictureFilePaths = pictureFiles.map(file => file.name)
      const { error: pictureDeleteError } = await supabase.storage
        .from('visitor-pictures')
        .remove(pictureFilePaths)
      
      if (pictureDeleteError) {
        console.error('Error deleting picture files:', pictureDeleteError)
      } else {
        deletedFiles += pictureFiles.length
        console.log(`Deleted ${pictureFiles.length} picture files`)
      }
    }

    // 2. Delete all files from visitor-signatures bucket
    console.log('Deleting files from visitor-signatures bucket...')
    const { data: signatureFiles, error: signatureListError } = await supabase.storage
      .from('visitor-signatures')
      .list()

    if (signatureListError) {
      console.error('Error listing signature files:', signatureListError)
    } else if (signatureFiles && signatureFiles.length > 0) {
      const signatureFilePaths = signatureFiles.map(file => file.name)
      const { error: signatureDeleteError } = await supabase.storage
        .from('visitor-signatures')
        .remove(signatureFilePaths)
      
      if (signatureDeleteError) {
        console.error('Error deleting signature files:', signatureDeleteError)
      } else {
        deletedFiles += signatureFiles.length
        console.log(`Deleted ${signatureFiles.length} signature files`)
      }
    }

    // 3. Delete all records from visitor_registrations table
    console.log('Deleting all visitor registration records...')
    const { data: deletedData, error: deleteRecordsError } = await supabase
      .from('visitor_registrations')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

    if (deleteRecordsError) {
      console.error('Error deleting visitor records:', deleteRecordsError)
    } else {
      console.log('Successfully deleted all visitor registration records')
      deletedRecords = 0; // Supabase delete doesn't return the count of deleted records
    }

    const summary = {
      success: true,
      timestamp: new Date().toISOString(),
      deletedFiles,
      deletedRecords,
      message: `Monthly cleanup completed successfully. Deleted ${deletedFiles} files and ${deletedRecords} records.`
    }

    console.log('Monthly cleanup completed:', summary)

    return new Response(JSON.stringify(summary), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('Error during monthly cleanup:', error)
    
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})