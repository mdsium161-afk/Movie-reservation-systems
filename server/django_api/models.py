from django.db import models


class UserProfile(models.Model):
    email = models.EmailField(unique=True)
    name = models.CharField(max_length=100)
    role = models.CharField(
        max_length=10,
        choices=[("user", "User"), ("admin", "Admin")],
        default="user",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.email})"


class MovieRecord(models.Model):
    title = models.CharField(max_length=200)
    genre = models.JSONField(default=list)
    duration = models.IntegerField()
    rating = models.FloatField(default=0)
    year = models.IntegerField()
    director = models.CharField(max_length=100)
    language = models.CharField(max_length=50, default="English")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


class BookingRecord(models.Model):
    STATUS_CHOICES = [("confirmed", "Confirmed"), ("cancelled", "Cancelled")]
    user_email = models.EmailField()
    movie_title = models.CharField(max_length=200)
    show_date = models.CharField(max_length=20)
    show_time = models.CharField(max_length=20)
    hall = models.CharField(max_length=20)
    seats = models.JSONField(default=list)
    total_price = models.FloatField()
    booking_ref = models.CharField(max_length=20, unique=True)
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default="confirmed")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.booking_ref} — {self.movie_title}"
