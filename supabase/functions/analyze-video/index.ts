
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

// Define types for our crowd analysis
type CrowdDensity = {
  overall: number;
  regions: {
    x: number;
    y: number;
    width: number;
    height: number;
    density: number;
  }[];
  totalPeopleCount: number;
  confidence: number;
};

type Incident = {
  id: string;
  type: string;
  severity: "low" | "medium" | "high";
  status: "active" | "resolved";
  location: string;
  description: string;
  timestamp: string;
};

// Create a Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { videoId } = await req.json();

    if (!videoId) {
      return new Response(
        JSON.stringify({ error: "Missing video ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get the video from the database
    const { data: video, error: videoError } = await supabase
      .from("videos")
      .select("*")
      .eq("id", videoId)
      .single();

    if (videoError || !video) {
      return new Response(
        JSON.stringify({ error: "Video not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Processing video analysis for video ID:", videoId);

    // In a real-world scenario, here you would:
    // 1. Download the video from storage
    // 2. Send it to a ML model API (like HuggingFace) for analysis
    // 3. Process the results and save them to the database

    // More realistic people count - between 50 and 200 for a crowd
    const peopleCount = Math.floor(Math.random() * 150) + 50;
    
    // For now, we're simulating crowd analysis with more realistic mock data
    const crowdDensity: CrowdDensity = {
      overall: Math.random() * 0.8 + 0.1, // Between 0.1 and 0.9
      totalPeopleCount: peopleCount,
      confidence: 0.92, // High confidence in our model
      regions: [
        {
          x: 0.1,
          y: 0.2,
          width: 0.3,
          height: 0.4,
          density: Math.random() * 0.7 + 0.2,
        },
        {
          x: 0.5,
          y: 0.6,
          width: 0.2,
          height: 0.3,
          density: Math.random() * 0.8 + 0.1,
        },
        {
          x: 0.7,
          y: 0.1,
          width: 0.25,
          height: 0.25,
          density: Math.random() * 0.9,
        },
      ],
    };

    // Generate more meaningful incidents
    const incidents: Incident[] = [];
    
    // Incident generation logic based on crowd density
    if (crowdDensity.overall > 0.7) {
      // High density situations are more likely to have incidents
      const incidentCount = Math.floor(Math.random() * 3) + 2; // 2-4 incidents
      
      for (let i = 0; i < incidentCount; i++) {
        const incidentTypes = ["overcrowding", "suspicious activity", "restricted area violation", "abnormal movement"];
        const locations = ["northeast corner", "main entrance", "center area", "west section", "south exit"];
        
        incidents.push({
          id: crypto.randomUUID(),
          type: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
          severity: Math.random() > 0.6 ? "high" : Math.random() > 0.4 ? "medium" : "low",
          status: Math.random() > 0.3 ? "active" : "resolved",
          location: locations[Math.floor(Math.random() * locations.length)],
          description: `Potential ${incidentTypes[Math.floor(Math.random() * incidentTypes.length)]} detected with ${peopleCount} people in view`,
          timestamp: new Date().toISOString(),
        });
      }
    } else if (crowdDensity.overall > 0.4) {
      // Medium density
      const incidentCount = Math.floor(Math.random() * 2) + 1; // 1-2 incidents
      
      const incidentTypes = ["suspicious activity", "unusual gathering", "potential security concern"];
      const locations = ["north section", "east entrance", "perimeter area", "central plaza"];
      
      for (let i = 0; i < incidentCount; i++) {
        incidents.push({
          id: crypto.randomUUID(),
          type: incidentTypes[Math.floor(Math.random() * incidentTypes.length)],
          severity: Math.random() > 0.7 ? "medium" : "low",
          status: Math.random() > 0.5 ? "active" : "resolved",
          location: locations[Math.floor(Math.random() * locations.length)],
          description: `Moderate concern with ${peopleCount} people detected in the area`,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // Low density, rare incidents
      if (Math.random() > 0.7) {
        incidents.push({
          id: crypto.randomUUID(),
          type: "unusual activity",
          severity: "low",
          status: Math.random() > 0.5 ? "active" : "resolved",
          location: "south perimeter",
          description: `Minor concern detected with ${peopleCount} people in low-density area`,
          timestamp: new Date().toISOString(),
        });
      }
    }

    console.log(`Analysis generated ${incidents.length} incidents with ${peopleCount} people counted`);

    // Save the analysis to the database
    const { error: analysisError } = await supabase
      .from("video_analysis")
      .insert({
        video_id: videoId,
        crowd_density: crowdDensity,
        incidents: incidents,
      });

    if (analysisError) {
      console.error("Error saving analysis:", analysisError);
      throw analysisError;
    }

    // Update the video status
    const { error: updateError } = await supabase
      .from("videos")
      .update({ status: "completed" })
      .eq("id", videoId);

    if (updateError) {
      console.error("Error updating video status:", updateError);
      throw updateError;
    }

    console.log("Video analysis completed successfully");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: "Video analysis complete",
        results: {
          crowdDensity,
          incidents,
        }
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error analyzing video:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
