async function listModules() {
  const { data, error } = await supabaseClient
    .from("modules")
    .select("*")
    .order("order_index", { ascending: true });
  if (error) throw error;
  return data || [];
}
async function getModuleBySlug(slug) {
  const { data, error } = await supabaseClient
    .from("modules")
    .select("*, lessons(*)")
    .eq("slug", slug)
    .single();
  if (error) throw error;
  return data;
}
async function getLessonsByModuleId(moduleId) {
  const { data, error } = await supabaseClient
    .from("lessons")
    .select("*")
    .eq("module_id", moduleId)
    .order("order_index");
  if (error) throw error;
  return data || [];
}
async function getOrCreateEnrollment(userId, moduleId) {
  const { data: existing } = await supabaseClient
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .maybeSingle();
  if (existing) return existing;
  const { data, error } = await supabaseClient
    .from("enrollments")
    .insert({
      user_id: userId,
      module_id: moduleId,
      status: "in_progress",
      progress: 0,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function updateProgress(userId, moduleId, progress, status) {
  const payload = { progress };
  if (status) payload.status = status;
  if (status === "completed") payload.completed_at = new Date().toISOString();
  const { data, error } = await supabaseClient
    .from("enrollments")
    .update(payload)
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function listUserEnrollments(userId) {
  const { data, error } = await supabaseClient
    .from("enrollments")
    .select("*, modules(id, title, slug, order_index)")
    .eq("user_id", userId);
  if (error) throw error;
  return data || [];
}
async function getQuizQuestions(moduleId) {
  const { data, error } = await supabaseClient
    .from("quiz_questions")
    .select("id, question_text, quiz_options(id, option_text, is_correct)")
    .eq("module_id", moduleId)
    .order("id");
  if (error) throw error;
  return data || [];
}
async function recordQuizAttempt(userId, moduleId, score, passed) {
  const { data, error } = await supabaseClient
    .from("quiz_attempts")
    .insert({ user_id: userId, module_id: moduleId, score, passed })
    .select()
    .single();
  if (error) throw error;
  return data;
}
async function issueCertificate(userId, moduleId, score) {
  const code = crypto.randomUUID();
  const { data, error } = await supabaseClient
    .from("certificates")
    .insert({
      user_id: userId,
      module_id: moduleId,
      score,
      certificate_code: code,
    })
    .select("id, certificate_code, issued_at")
    .single();
  if (error) throw error;
  return data;
}
async function markLessonComplete(userId, lessonId) {
  const { data, error } = await supabaseClient.from("lesson_progress").upsert(
    {
      user_id: userId,
      lesson_id: lessonId,
      completed_at: new Date().toISOString(),
    },
    { onConflict: "user_id,lesson_id" },
  );
  if (error) throw error;
  return data;
}
async function markLessonIncomplete(userId, lessonId) {
  const { data, error } = await supabaseClient
    .from("lesson_progress")
    .update({ completed_at: null })
    .eq("user_id", userId)
    .eq("lesson_id", lessonId)
    .select();
  if (error) throw error;
  return data.length > 0;
}
async function getCompletedLessonIds(userId, lessonIds) {
  const { data, error } = await supabaseClient
    .from("lesson_progress")
    .select("lesson_id")
    .eq("user_id", userId)
    .in("lesson_id", lessonIds)
    .not("completed_at", "is", null);
  if (error) throw error;
  return data.map((d) => d.lesson_id);
}
async function hasPassedQuiz(userId, moduleId) {
  const { data, error } = await supabaseClient
    .from("quiz_attempts")
    .select("passed")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .eq("passed", true)
    .limit(1);
  if (error) throw error;
  return data.length > 0;
}
async function getUserCertificates(userId) {
  const { data, error } = await supabaseClient
    .from("certificates")
    .select("*, modules(title, id)")
    .eq("user_id", userId);
  if (error) throw error;
  return data || [];
}
async function getCertificateByModuleId(userId, moduleId) {
  const { data, error } = await supabaseClient
    .from("certificates")
    .select("*")
    .eq("user_id", userId)
    .eq("module_id", moduleId)
    .maybeSingle();
  if (error) throw error;
  return data;
}
