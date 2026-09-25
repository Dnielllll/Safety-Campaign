-- Create Community Surveys for Daniel Rivera (danieljimenezjr30@gmail.com)
-- Run this in Supabase Dashboard -> SQL Editor -> New Query

-- First, get Daniel Rivera's user ID
DO $$
DECLARE
    daniel_user_id UUID;
    survey_id UUID;
BEGIN
    -- Get Daniel Rivera's user ID
    SELECT id INTO daniel_user_id 
    FROM public.users 
    WHERE email = 'danieljimenezjr30@gmail.com';
    
    IF daniel_user_id IS NULL THEN
        RAISE EXCEPTION 'User danieljimenezjr30@gmail.com not found';
    END IF;
    
    RAISE NOTICE 'Found user ID: %', daniel_user_id;
    
    -- Create Fire Safety Awareness Survey
    INSERT INTO public.surveys (title, description, created_by, status)
    VALUES (
        'Fire Safety Awareness Survey',
        'Help us assess the community''s level of fire safety awareness.',
        daniel_user_id,
        'published'
    )
    RETURNING id INTO survey_id;
    
    RAISE NOTICE 'Created Fire Safety Survey with ID: %', survey_id;
    
    -- Add questions for Fire Safety Survey
    INSERT INTO public.survey_questions (survey_id, question_text, question_type, options, order_index, required) VALUES
    (survey_id, 'Do you have a fire extinguisher at home?', 'multiple_choice', ARRAY['Yes', 'No', 'Planning to get one'], 0, true),
    (survey_id, 'How would you rate the barangay''s fire safety campaign?', 'rating', NULL, 1, true),
    (survey_id, 'What improvements would you suggest?', 'text', NULL, 2, true),
    (survey_id, 'Do you know the emergency fire hotline number?', 'multiple_choice', ARRAY['Yes', 'No'], 3, true),
    (survey_id, 'How often do you check electrical appliances for safety?', 'multiple_choice', ARRAY['Daily', 'Weekly', 'Monthly', 'Rarely'], 4, true);
    
    -- Create Dengue Prevention Campaign Evaluation
    INSERT INTO public.surveys (title, description, created_by, status)
    VALUES (
        'Dengue Prevention Campaign Evaluation',
        'Evaluate the effectiveness of the dengue prevention campaign.',
        daniel_user_id,
        'published'
    )
    RETURNING id INTO survey_id;
    
    RAISE NOTICE 'Created Dengue Prevention Survey with ID: %', survey_id;
    
    -- Add questions for Dengue Prevention Survey
    INSERT INTO public.survey_questions (survey_id, question_text, question_type, options, order_index, required) VALUES
    (survey_id, 'Have you applied the 4S strategy in your home?', 'multiple_choice', ARRAY['Yes, all 4 steps', 'Some steps only', 'Not yet'], 0, true),
    (survey_id, 'Rate the campaign''s impact in your area', 'rating', NULL, 1, true),
    (survey_id, 'Additional comments', 'text', NULL, 2, true),
    (survey_id, 'How often do you clean potential mosquito breeding sites?', 'multiple_choice', ARRAY['Daily', 'Weekly', 'Monthly', 'Rarely'], 3, true),
    (survey_id, 'Have you or a family member had dengue in the past year?', 'multiple_choice', ARRAY['Yes', 'No'], 4, true);
    
    -- Create Flood Evacuation Route Awareness
    INSERT INTO public.surveys (title, description, created_by, status)
    VALUES (
        'Flood Evacuation Route Awareness',
        'Assess awareness of flood evacuation procedures and routes.',
        daniel_user_id,
        'published'
    )
    RETURNING id INTO survey_id;
    
    RAISE NOTICE 'Created Flood Evacuation Survey with ID: %', survey_id;
    
    -- Add questions for Flood Evacuation Survey
    INSERT INTO public.survey_questions (survey_id, question_text, question_type, options, order_index, required) VALUES
    (survey_id, 'Do you know the designated evacuation route for your area?', 'multiple_choice', ARRAY['Yes', 'No'], 0, true),
    (survey_id, 'Rate the clarity of evacuation route signage', 'rating', NULL, 1, true),
    (survey_id, 'Have you participated in a flood drill?', 'multiple_choice', ARRAY['Yes', 'No'], 2, true),
    (survey_id, 'Do you have an emergency preparedness kit?', 'multiple_choice', ARRAY['Yes', 'No', 'In progress'], 3, true),
    (survey_id, 'Suggestions for improving evacuation procedures', 'text', NULL, 4, true);
    
    -- Create Anti-Scam Awareness Campaign
    INSERT INTO public.surveys (title, description, created_by, status)
    VALUES (
        'Anti-Scam Awareness Campaign',
        'Evaluate the effectiveness of anti-scam awareness efforts.',
        daniel_user_id,
        'published'
    )
    RETURNING id INTO survey_id;
    
    RAISE NOTICE 'Created Anti-Scam Survey with ID: %', survey_id;
    
    -- Add questions for Anti-Scam Survey
    INSERT INTO public.survey_questions (survey_id, question_text, question_type, options, order_index, required) VALUES
    (survey_id, 'Are you aware of common scam tactics?', 'multiple_choice', ARRAY['Yes, very aware', 'Somewhat aware', 'Not aware'], 0, true),
    (survey_id, 'Rate the usefulness of anti-scam information provided', 'rating', NULL, 1, true),
    (survey_id, 'Have you encountered a scam attempt recently?', 'multiple_choice', ARRAY['Yes', 'No'], 2, true),
    (survey_id, 'Do you know how to report scams?', 'multiple_choice', ARRAY['Yes', 'No'], 3, true),
    (survey_id, 'What additional anti-scam topics would you like to learn about?', 'text', NULL, 4, true);
    
    -- Create Environmental Cleanliness Campaign
    INSERT INTO public.surveys (title, description, created_by, status)
    VALUES (
        'Environmental Cleanliness Campaign',
        'Assess the impact of environmental cleanliness initiatives.',
        daniel_user_id,
        'published'
    )
    RETURNING id INTO survey_id;
    
    RAISE NOTICE 'Created Environmental Cleanliness Survey with ID: %', survey_id;
    
    -- Add questions for Environmental Cleanliness Survey
    INSERT INTO public.survey_questions (survey_id, question_text, question_type, options, order_index, required) VALUES
    (survey_id, 'How would you rate the cleanliness of your neighborhood?', 'rating', NULL, 0, true),
    (survey_id, 'Do you participate in community clean-up activities?', 'multiple_choice', ARRAY['Regularly', 'Sometimes', 'Never'], 1, true),
    (survey_id, 'Rate the effectiveness of waste management in your area', 'rating', NULL, 2, true),
    (survey_id, 'Do you practice proper waste segregation?', 'multiple_choice', ARRAY['Always', 'Sometimes', 'Never'], 3, true),
    (survey_id, 'Suggestions for improving environmental cleanliness', 'text', NULL, 4, true);
    
    -- Create Road Safety Awareness Survey
    INSERT INTO public.surveys (title, description, created_by, status)
    VALUES (
        'Road Safety Awareness Survey',
        'Evaluate road safety awareness and campaign effectiveness.',
        daniel_user_id,
        'published'
    )
    RETURNING id INTO survey_id;
    
    RAISE NOTICE 'Created Road Safety Survey with ID: %', survey_id;
    
    -- Add questions for Road Safety Survey
    INSERT INTO public.survey_questions (survey_id, question_text, question_type, options, order_index, required) VALUES
    (survey_id, 'Do you follow traffic rules consistently?', 'multiple_choice', ARRAY['Always', 'Sometimes', 'Rarely'], 0, true),
    (survey_id, 'Rate the visibility of road safety signs in your area', 'rating', NULL, 1, true),
    (survey_id, 'Have you attended a road safety seminar?', 'multiple_choice', ARRAY['Yes', 'No'], 2, true),
    (survey_id, 'How would you rate pedestrian safety in your area?', 'rating', NULL, 3, true),
    (survey_id, 'Suggestions for improving road safety', 'text', NULL, 4, true);
    
    RAISE NOTICE 'All 6 community surveys created successfully for Daniel Rivera!';
END $$;