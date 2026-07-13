import React, { useState, useRef } from 'react';
import { Mail, MapPin, Loader, CheckCircle, Send } from 'lucide-react';
import Button from '../common/Button';
import Input from '../common/Input';
import toast from 'react-hot-toast';
import { trackContactFormSubmit } from '../../utils/analytics';

// Get API base URL from environment or use default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

/**
 * ContactSection Component
 * Displays a comprehensive contact form with validation and submission handling
 * Features: Email validation, required field validation, success feedback
 */
const ContactSection = () => {
  const contactFormRef = useRef(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  /**
   * Validate form fields
   */
  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Subject validation
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    } else if (formData.subject.trim().length < 3) {
      newErrors.subject = 'Subject must be at least 3 characters';
    }

    // Message validation
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle input change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  /**
   * Handle form submission
   * Sends data to backend API at /api/contact
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!validateForm()) {
      toast.error('Please fix the errors above');
      return;
    }

    setIsSubmitting(true);

    try {
      // Track event
      trackContactFormSubmit(formData.subject);

      // Send to backend API with correct base URL
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send message');
      }

      // Success feedback
      setSubmitted(true);
      toast.success('Message sent successfully! We\'ll get back to you soon.', {
        duration: 5000,
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: ''
      });

      // Reset submitted state after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Get in Touch with SpeakWise
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Have questions, feedback, or want to collaborate? We'd love to hear from you. 
            Reach out to us and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Contact Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Email Card */}
            <div className="bg-gradient-to-br from-[#1FB6A6]/10 to-[#17A293]/10 border border-[#1FB6A6]/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#1FB6A6] rounded-lg flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Email
                  </h3>
                  <a
                    href="mailto:speakwise.aicoach@gmail.com"
                    className="text-[#1FB6A6] hover:text-[#17A293] font-medium transition-colors"
                  >
                    speakwise.aicoach@gmail.com
                  </a>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    We typically respond within 24 hours
                  </p>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-gradient-to-br from-[#6C63FF]/10 to-[#5A52E8]/10 border border-[#6C63FF]/20 rounded-xl p-6 hover:shadow-lg transition-all duration-300">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#6C63FF] rounded-lg flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                    Location
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    India
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    Based in India, supporting users worldwide
                  </p>
                </div>
              </div>
            </div>
          </div>


          {/* Right Column - Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
              {submitted ? (
                // Success State
                <div className="text-center py-12">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Message Sent!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Thank you for reaching out. We'll get back to you as soon as possible.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => setSubmitted(false)}
                    className="bg-[#1FB6A6] hover:bg-[#17A293] text-white"
                  >
                    Send Another Message
                  </Button>
                </div>
              ) : (
                // Form State
                <form ref={contactFormRef} onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Input */}
                  <div>
                    <Input
                      type="text"
                      name="name"
                      label="Full Name"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleChange}
                      error={!!errors.name}
                      disabled={isSubmitting}
                      className="w-full"
                    />
                    {errors.name && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Email Input */}
                  <div>
                    <Input
                      type="email"
                      name="email"
                      label="Email Address"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      error={!!errors.email}
                      disabled={isSubmitting}
                      className="w-full"
                    />
                    {errors.email && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Subject Input */}
                  <div>
                    <Input
                      type="text"
                      name="subject"
                      label="Subject"
                      placeholder="What is this about?"
                      value={formData.subject}
                      onChange={handleChange}
                      error={!!errors.subject}
                      disabled={isSubmitting}
                      className="w-full"
                    />
                    {errors.subject && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                        {errors.subject}
                      </p>
                    )}
                  </div>

                  {/* Message Textarea */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Message
                    </label>
                    <textarea
                      name="message"
                      placeholder="Tell us your thoughts, questions, or feedback..."
                      value={formData.message}
                      onChange={handleChange}
                      disabled={isSubmitting}
                      rows="5"
                      className={`w-full px-4 py-3 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#1FB6A6] focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none ${
                        errors.message
                          ? 'border-red-300 dark:border-red-600 focus:ring-red-500'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    />
                    {errors.message && (
                      <p className="text-red-500 dark:text-red-400 text-sm mt-1">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isSubmitting}
                    disabled={isSubmitting}
                    icon={isSubmitting ? Loader : Send}
                    className="w-full bg-[#1FB6A6] hover:bg-[#17A293] text-white font-semibold shadow-lg"
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>

                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    We respect your privacy. We'll never share your information with third parties.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
