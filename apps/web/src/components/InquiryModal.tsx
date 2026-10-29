'use client';

import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { X, CheckCircle, Send, User, Phone, FileText } from 'lucide-react';

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InquiryModal({ isOpen, onClose }: InquiryModalProps) {
  const { t } = useLanguage();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'buyer',
    details: '',
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) return;
    setSubmitted(true);
    setTimeout(() => {}, 2000);
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setFormData({ name: '', phone: '', role: 'buyer', details: '' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-secondary/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-border overflow-hidden relative animate-in slide-up duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-secondary tracking-tight">
              {t.modal?.title || 'Contact Us'}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              {t.modal?.desc || 'Have questions? We\'d love to hear from you.'}
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1 rounded-lg text-text-muted hover:text-text hover:bg-background-alt transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content / Form */}
        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-secondary">
                {t.modal?.successMsg || 'Message Sent!'}
              </h4>
              <p className="text-sm text-text-muted max-w-sm mx-auto">
                {t.modal?.successSubtext || 'Our team will get back to you within 24 hours.'}
              </p>
              <button
                type="button"
                onClick={handleResetAndClose}
                className="mt-4 px-6 py-2 btn-primary"
              >
                {t.modal?.closeBtn || 'Close'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">
                  {t.modal?.nameLabel || 'Name'} <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-text-light absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={t.modal?.namePlaceholder || 'Your name'}
                    className="input pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  {t.modal?.phoneLabel || 'Phone'} <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-text-light absolute left-3 top-2.5" />
                  <input
                    type="tel"
                    required
                    pattern="[0-9]{10}"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t.modal?.phonePlaceholder || '10-digit mobile number'}
                    className="input pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="label">
                  {t.modal?.roleLabel || 'I am a'}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'farmer' })}
                    className={`py-2 px-2 text-[11px] rounded-lg border text-center font-medium transition ${
                      formData.role === 'farmer'
                        ? 'bg-primary-light text-primary border-primary font-bold'
                        : 'bg-background text-text-muted border-border hover:bg-background-alt'
                    }`}
                  >
                    {t.modal?.roleFarmer || 'Farmer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'buyer' })}
                    className={`py-2 px-2 text-[11px] rounded-lg border text-center font-medium transition ${
                      formData.role === 'buyer'
                        ? 'bg-primary-light text-primary border-primary font-bold'
                        : 'bg-background text-text-muted border-border hover:bg-background-alt'
                    }`}
                  >
                    {t.modal?.roleBuyer || 'Buyer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, role: 'warehouse' })}
                    className={`py-2 px-2 text-[11px] rounded-lg border text-center font-medium transition ${
                      formData.role === 'warehouse'
                        ? 'bg-primary-light text-primary border-primary font-bold'
                        : 'bg-background text-text-muted border-border hover:bg-background-alt'
                    }`}
                  >
                    {t.modal?.roleWarehouse || 'Warehouse'}
                  </button>
                </div>
              </div>

              <div>
                <label className="label">
                  {t.modal?.detailsLabel || 'Details'}
                </label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-text-light absolute left-3 top-2.5" />
                  <textarea
                    rows={3}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder={t.modal?.detailsPlaceholder || 'How can we help?'}
                    className="input pl-9 resize-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="btn-ghost text-sm"
                >
                  {t.modal?.closeBtn || 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm"
                >
                  <span>{t.modal?.submitBtn || 'Send Message'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}