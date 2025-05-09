from django.db import models
from django.contrib.auth.models import User


class Pitch(models.Model):
    STATUS_CHOICES = (
        ('draft', 'Draft'),
        ('published', 'Published'),
        ('featured', 'Featured'),
        ('archived', 'Archived'),
    )

    FUNDING_STAGE_CHOICES = (
        ('pre_seed', 'Pre-Seed'),
        ('seed', 'Seed'),
        ('series_a', 'Series A'),
        ('series_b', 'Series B'),
        ('series_c', 'Series C'),
        ('growth', 'Growth'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pitches')
    title = models.CharField(max_length=255)
    tagline = models.CharField(max_length=255, blank=True, null=True)
    description = models.TextField()

    # Pitch details
    company_name = models.CharField(max_length=255)
    logo = models.ImageField(upload_to='pitch_logos/', blank=True, null=True)
    cover_image = models.ImageField(upload_to='pitch_covers/', blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    video_url = models.URLField(blank=True, null=True)

    # Business model
    problem = models.TextField(blank=True, null=True)
    solution = models.TextField(blank=True, null=True)
    business_model = models.TextField(blank=True, null=True)
    market_size = models.TextField(blank=True, null=True)
    competition = models.TextField(blank=True, null=True)
    traction = models.TextField(blank=True, null=True)

    # Financial information
    funding_stage = models.CharField(max_length=20, choices=FUNDING_STAGE_CHOICES, default='pre_seed')
    funding_amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    valuation = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    revenue = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True)
    revenue_model = models.TextField(blank=True, null=True)

    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    views_count = models.PositiveIntegerField(default=0)
    likes_count = models.PositiveIntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title


class PitchAttachment(models.Model):
    TYPE_CHOICES = (
        ('pdf', 'PDF Document'),
        ('image', 'Image'),
        ('financial', 'Financial Document'),
        ('other', 'Other'),
    )

    pitch = models.ForeignKey(Pitch, on_delete=models.CASCADE, related_name='attachments')
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to='pitch_attachments/')
    file_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='other')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.pitch.title})"


class PitchLike(models.Model):
    pitch = models.ForeignKey(Pitch, on_delete=models.CASCADE, related_name='likes')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pitch_likes')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('pitch', 'user')

    def __str__(self):
        return f"{self.user.username} likes {self.pitch.title}"


class PitchComment(models.Model):
    pitch = models.ForeignKey(Pitch, on_delete=models.CASCADE, related_name='comments')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pitch_comments')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Comment on {self.pitch.title} by {self.user.username}"


class PitchQuestion(models.Model):
    STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('answered', 'Answered'),
        ('rejected', 'Rejected'),
    )

    pitch = models.ForeignKey(Pitch, on_delete=models.CASCADE, related_name='questions')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pitch_questions')
    question = models.TextField()
    answer = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Question on {self.pitch.title} by {self.user.username}"
