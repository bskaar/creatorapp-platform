import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  Play,
  Check,
  Lock,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  Headphones,
  HelpCircle,
  ArrowLeft,
  Award,
  Loader2,
} from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content_type: 'video' | 'audio' | 'text' | 'pdf' | 'quiz';
  content_text: string | null;
  media_url: string | null;
  media_duration_seconds: number | null;
  is_preview: boolean;
  order_index: number;
}

interface Product {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  site_id: string;
  sites: {
    name: string;
    logo_url: string | null;
    primary_color: string;
  };
}

interface LessonCompletion {
  lesson_id: string;
  completed_at: string;
  progress_percent: number;
}

export default function StudentCourse() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [completions, setCompletions] = useState<Map<string, LessonCompletion>>(new Map());
  const [hasAccess, setHasAccess] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [markingComplete, setMarkingComplete] = useState(false);

  const currentLesson = lessons.find((l) => l.id === currentLessonId);
  const overallProgress = lessons.length > 0
    ? Math.round((completions.size / lessons.length) * 100)
    : 0;

  const loadCourseData = useCallback(async () => {
    if (!productId || !user) return;

    try {
      const { data: accessData } = await supabase
        .from('product_access')
        .select('id')
        .eq('product_id', productId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (!accessData) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      setHasAccess(true);

      const [productResult, lessonsResult, completionsResult] = await Promise.all([
        supabase
          .from('products')
          .select(`
            id,
            title,
            description,
            thumbnail_url,
            site_id,
            sites (
              name,
              logo_url,
              primary_color
            )
          `)
          .eq('id', productId)
          .maybeSingle(),
        supabase
          .from('lessons')
          .select('*')
          .eq('product_id', productId)
          .order('order_index', { ascending: true }),
        supabase
          .from('lesson_completions')
          .select('lesson_id, completed_at, progress_percent')
          .eq('product_id', productId)
          .eq('user_id', user.id),
      ]);

      if (productResult.data) {
        setProduct(productResult.data as Product);
      }

      if (lessonsResult.data) {
        setLessons(lessonsResult.data);
        if (lessonsResult.data.length > 0 && !currentLessonId) {
          const completionsMap = new Map<string, LessonCompletion>();
          completionsResult.data?.forEach((c) => {
            completionsMap.set(c.lesson_id, c);
          });
          const firstIncomplete = lessonsResult.data.find(
            (l) => !completionsMap.has(l.id)
          );
          setCurrentLessonId(firstIncomplete?.id || lessonsResult.data[0].id);
        }
      }

      if (completionsResult.data) {
        const completionsMap = new Map<string, LessonCompletion>();
        completionsResult.data.forEach((c) => {
          completionsMap.set(c.lesson_id, c);
        });
        setCompletions(completionsMap);
      }
    } catch (err) {
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  }, [productId, user, currentLessonId]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  const markLessonComplete = async () => {
    if (!currentLessonId || !user || !productId || !product) return;

    setMarkingComplete(true);

    try {
      const { error } = await supabase.from('lesson_completions').upsert(
        {
          user_id: user.id,
          lesson_id: currentLessonId,
          product_id: productId,
          site_id: product.site_id,
          completed_at: new Date().toISOString(),
          progress_percent: 100,
        },
        { onConflict: 'user_id,lesson_id' }
      );

      if (error) throw error;

      setCompletions((prev) => {
        const updated = new Map(prev);
        updated.set(currentLessonId, {
          lesson_id: currentLessonId,
          completed_at: new Date().toISOString(),
          progress_percent: 100,
        });
        return updated;
      });

      const currentIndex = lessons.findIndex((l) => l.id === currentLessonId);
      if (currentIndex < lessons.length - 1) {
        setCurrentLessonId(lessons[currentIndex + 1].id);
      }
    } catch (err) {
      console.error('Error marking complete:', err);
    } finally {
      setMarkingComplete(false);
    }
  };

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'audio':
        return Headphones;
      case 'text':
      case 'pdf':
        return FileText;
      case 'quiz':
        return HelpCircle;
      default:
        return Play;
    }
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white" />
      </div>
    );
  }

  if (!hasAccess || !product) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
          <Lock className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Required</h1>
          <p className="text-gray-400 mb-6">
            You don't have access to this course. Please purchase it to continue.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const primaryColor = product.sites?.primary_color || '#3B82F6';

  return (
    <div className="min-h-screen bg-gray-900 flex">
      <div
        className={`fixed inset-y-0 left-0 z-30 w-80 bg-gray-800 transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-400 hover:text-white mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </button>
            {product.sites?.logo_url && (
              <img
                src={product.sites.logo_url}
                alt={product.sites.name}
                className="h-8 mb-3"
              />
            )}
            <h1 className="text-lg font-bold text-white line-clamp-2">{product.title}</h1>
          </div>

          <div className="p-4 border-b border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progress</span>
              <span className="text-sm font-medium text-white">{overallProgress}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{ width: `${overallProgress}%`, backgroundColor: primaryColor }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {completions.size} of {lessons.length} lessons completed
            </p>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-2">
              {lessons.map((lesson, index) => {
                const isComplete = completions.has(lesson.id);
                const isCurrent = lesson.id === currentLessonId;
                const ContentIcon = getContentIcon(lesson.content_type);

                return (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLessonId(lesson.id)}
                    className={`w-full text-left p-3 rounded-lg mb-1 transition ${
                      isCurrent
                        ? 'bg-gray-700'
                        : 'hover:bg-gray-700/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          isComplete
                            ? 'bg-green-600'
                            : isCurrent
                            ? ''
                            : 'bg-gray-600'
                        }`}
                        style={isCurrent && !isComplete ? { backgroundColor: primaryColor } : {}}
                      >
                        {isComplete ? (
                          <Check className="h-4 w-4 text-white" />
                        ) : (
                          <span className="text-sm text-white font-medium">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm font-medium truncate ${
                            isCurrent ? 'text-white' : 'text-gray-300'
                          }`}
                        >
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <ContentIcon className="h-3 w-3 text-gray-500" />
                          <span className="text-xs text-gray-500 capitalize">
                            {lesson.content_type}
                          </span>
                          {lesson.media_duration_seconds && (
                            <span className="text-xs text-gray-500">
                              {formatDuration(lesson.media_duration_seconds)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {overallProgress === 100 && (
            <div className="p-4 border-t border-gray-700">
              <div className="flex items-center gap-3 p-3 bg-green-900/30 rounded-lg mb-3">
                <Award className="h-6 w-6 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-green-400">Course Complete!</p>
                  <p className="text-xs text-green-500/70">You've finished all lessons</p>
                </div>
              </div>
              <button
                onClick={() => navigate(`/certificate/${productId}`)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition"
                style={{ backgroundColor: primaryColor }}
              >
                <Award className="h-4 w-4" />
                View Certificate
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-40 lg:hidden p-2 bg-gray-800 rounded-lg text-white"
      >
        {sidebarOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
      </button>

      <div className={`flex-1 ${sidebarOpen ? 'lg:ml-80' : ''}`}>
        {currentLesson ? (
          <div className="min-h-screen flex flex-col">
            {currentLesson.content_type === 'video' && currentLesson.media_url && (
              <div className="aspect-video bg-black">
                {currentLesson.media_url.includes('youtube.com') ||
                currentLesson.media_url.includes('youtu.be') ? (
                  <iframe
                    src={currentLesson.media_url
                      .replace('watch?v=', 'embed/')
                      .replace('youtu.be/', 'youtube.com/embed/')}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : currentLesson.media_url.includes('vimeo.com') ? (
                  <iframe
                    src={currentLesson.media_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                    className="w-full h-full"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={currentLesson.media_url}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>
            )}

            {currentLesson.content_type === 'audio' && currentLesson.media_url && (
              <div className="p-8 bg-gray-800">
                <div className="max-w-2xl mx-auto">
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className="w-20 h-20 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: primaryColor }}
                    >
                      <Headphones className="h-10 w-10 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{currentLesson.title}</h2>
                      {currentLesson.media_duration_seconds && (
                        <p className="text-gray-400">
                          Duration: {formatDuration(currentLesson.media_duration_seconds)}
                        </p>
                      )}
                    </div>
                  </div>
                  <audio
                    src={currentLesson.media_url}
                    controls
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {currentLesson.content_type === 'pdf' && currentLesson.media_url && (
              <div className="flex-1 bg-gray-800">
                <iframe
                  src={currentLesson.media_url}
                  className="w-full h-[70vh]"
                  title={currentLesson.title}
                />
              </div>
            )}

            <div className="flex-1 p-8 overflow-y-auto">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-white mb-4">{currentLesson.title}</h2>

                {currentLesson.description && (
                  <p className="text-gray-400 mb-6">{currentLesson.description}</p>
                )}

                {(currentLesson.content_type === 'text' || currentLesson.content_text) && (
                  <div className="prose prose-invert max-w-none mb-8">
                    <div className="whitespace-pre-wrap text-gray-300">
                      {currentLesson.content_text}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-gray-700">
                  <div className="flex items-center gap-2">
                    {completions.has(currentLesson.id) ? (
                      <div className="flex items-center gap-2 text-green-400">
                        <Check className="h-5 w-5" />
                        <span>Completed</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="h-5 w-5" />
                        <span>In Progress</span>
                      </div>
                    )}
                  </div>

                  {!completions.has(currentLesson.id) && (
                    <button
                      onClick={markLessonComplete}
                      disabled={markingComplete}
                      className="flex items-center gap-2 px-6 py-3 text-white rounded-lg transition disabled:opacity-50"
                      style={{ backgroundColor: primaryColor }}
                    >
                      {markingComplete ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Check className="h-5 w-5" />
                      )}
                      Mark as Complete
                    </button>
                  )}

                  {completions.has(currentLesson.id) &&
                    lessons.findIndex((l) => l.id === currentLesson.id) < lessons.length - 1 && (
                      <button
                        onClick={() => {
                          const currentIndex = lessons.findIndex((l) => l.id === currentLesson.id);
                          setCurrentLessonId(lessons[currentIndex + 1].id);
                        }}
                        className="flex items-center gap-2 px-6 py-3 text-white rounded-lg transition"
                        style={{ backgroundColor: primaryColor }}
                      >
                        Next Lesson
                      </button>
                    )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <p className="text-gray-500">Select a lesson to begin</p>
          </div>
        )}
      </div>
    </div>
  );
}
