using Fishio.Domain.ValueObjects;
using FluentAssertions;
using Xunit;

namespace Fishio.Domain.Tests.ValueObjects;

public class AgeRangeTests
{
    [Fact]
    public void Constructor_WithValidParameters_ShouldCreateAgeRange()
    {
        // Act
        var ageRange = new AgeRange(18, 65);

        // Assert
        ageRange.MinAge.Should().Be(18);
        ageRange.MaxAge.Should().Be(65);
    }

    [Fact]
    public void Constructor_WithNullParameters_ShouldCreateAgeRange()
    {
        // Act
        var ageRange = new AgeRange();

        // Assert
        ageRange.MinAge.Should().BeNull();
        ageRange.MaxAge.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithOnlyMinAge_ShouldCreateAgeRange()
    {
        // Act
        var ageRange = new AgeRange(18);

        // Assert
        ageRange.MinAge.Should().Be(18);
        ageRange.MaxAge.Should().BeNull();
    }

    [Fact]
    public void Constructor_WithOnlyMaxAge_ShouldCreateAgeRange()
    {
        // Act
        var ageRange = new AgeRange(maxAge: 17);

        // Assert
        ageRange.MinAge.Should().BeNull();
        ageRange.MaxAge.Should().Be(17);
    }

    [Theory]
    [InlineData(-1, 18)]
    [InlineData(18, -1)]
    [InlineData(-5, -10)]
    public void Constructor_WithNegativeAge_ShouldThrowArgumentException(int minAge, int maxAge)
    {
        // Act & Assert
        var action = () => new AgeRange(minAge, maxAge);
        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Constructor_WithMinAgeGreaterThanMaxAge_ShouldThrowArgumentException()
    {
        // Act & Assert
        var action = () => new AgeRange(25, 18);
        action.Should().Throw<ArgumentException>();
    }

    [Fact]
    public void Junior_ShouldCreateCorrectAgeRange()
    {
        // Act
        var junior = AgeRange.Junior;

        // Assert
        junior.MinAge.Should().BeNull();
        junior.MaxAge.Should().Be(17);
    }

    [Fact]
    public void Senior_ShouldCreateCorrectAgeRange()
    {
        // Act
        var senior = AgeRange.Senior;

        // Assert
        senior.MinAge.Should().Be(55);
        senior.MaxAge.Should().BeNull();
    }

    [Fact]
    public void Adult_ShouldCreateCorrectAgeRange()
    {
        // Act
        var adult = AgeRange.Adult;

        // Assert
        adult.MinAge.Should().Be(18);
        adult.MaxAge.Should().Be(54);
    }

    [Fact]
    public void AllAges_ShouldCreateCorrectAgeRange()
    {
        // Act
        var allAges = AgeRange.AllAges;

        // Assert
        allAges.MinAge.Should().BeNull();
        allAges.MaxAge.Should().BeNull();
    }

    [Theory]
    [InlineData(16, true)]   // Under 18
    [InlineData(17, true)]   // Exactly 17
    [InlineData(18, false)]  // Over 17
    [InlineData(25, false)]  // Over 17
    public void Contains_WithJuniorRange_ShouldReturnCorrectResult(int age, bool expected)
    {
        // Arrange
        var junior = AgeRange.Junior;

        // Act
        var result = junior.Contains(age);

        // Assert
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData(54, false)]  // Under 55
    [InlineData(55, true)]   // Exactly 55
    [InlineData(65, true)]   // Over 55
    [InlineData(80, true)]   // Over 55
    public void Contains_WithSeniorRange_ShouldReturnCorrectResult(int age, bool expected)
    {
        // Arrange
        var senior = AgeRange.Senior;

        // Act
        var result = senior.Contains(age);

        // Assert
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData(17, false)]  // Under 18
    [InlineData(18, true)]   // Exactly 18
    [InlineData(35, true)]   // Middle age
    [InlineData(54, true)]   // Exactly 54
    [InlineData(55, false)]  // Over 54
    public void Contains_WithAdultRange_ShouldReturnCorrectResult(int age, bool expected)
    {
        // Arrange
        var adult = AgeRange.Adult;

        // Act
        var result = adult.Contains(age);

        // Assert
        result.Should().Be(expected);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(25)]
    [InlineData(100)]
    public void Contains_WithAllAgesRange_ShouldReturnTrueForAnyAge(int age)
    {
        // Arrange
        var allAges = AgeRange.AllAges;

        // Act
        var result = allAges.Contains(age);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void Contains_WithNegativeAge_ShouldReturnFalse()
    {
        // Arrange
        var ageRange = new AgeRange(18, 65);

        // Act
        var result = ageRange.Contains(-5);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void Contains_WithDateTime_ShouldCalculateAgeCorrectly()
    {
        // Arrange
        var ageRange = new AgeRange(18, 65);
        var birthDate = DateTime.Today.AddYears(-25);

        // Act
        var result = ageRange.Contains(birthDate);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void Contains_WithDateOnly_ShouldCalculateAgeCorrectly()
    {
        // Arrange
        var ageRange = new AgeRange(18, 65);
        var birthDate = DateOnly.FromDateTime(DateTime.Today.AddYears(-25));

        // Act
        var result = ageRange.Contains(birthDate);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void Overlaps_WithOverlappingRanges_ShouldReturnTrue()
    {
        // Arrange
        var range1 = new AgeRange(18, 35);
        var range2 = new AgeRange(25, 45);

        // Act
        var result = range1.Overlaps(range2);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public void Overlaps_WithNonOverlappingRanges_ShouldReturnFalse()
    {
        // Arrange
        var range1 = new AgeRange(18, 25);
        var range2 = new AgeRange(30, 40);

        // Act
        var result = range1.Overlaps(range2);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void Overlaps_WithAdjacentRanges_ShouldReturnFalse()
    {
        // Arrange
        var range1 = new AgeRange(18, 25);
        var range2 = new AgeRange(26, 35);

        // Act
        var result = range1.Overlaps(range2);

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void Overlaps_WithUnboundedRanges_ShouldReturnTrue()
    {
        // Arrange
        var range1 = new AgeRange(18);
        var range2 = new AgeRange(maxAge: 25);

        // Act
        var result = range1.Overlaps(range2);

        // Assert
        result.Should().BeTrue();
    }

    [Theory]
    [InlineData(18, 25, "18-25 lat")]
    [InlineData(18, 18, "18 lat")]
    [InlineData(18, null, "18+ lat")]
    [InlineData(null, 17, "do 17 lat")]
    [InlineData(null, null, "wszystkie wieki")]
    public void GetDescription_ShouldReturnCorrectDescription(int? minAge, int? maxAge, string expected)
    {
        // Arrange
        var ageRange = new AgeRange(minAge, maxAge);

        // Act
        var result = ageRange.GetDescription();

        // Assert
        result.Should().Be(expected);
    }

    [Fact]
    public void GetShortName_WithJuniorRange_ShouldReturnJunior()
    {
        // Act
        var result = AgeRange.Junior.GetShortName();

        // Assert
        result.Should().Be("Junior");
    }

    [Fact]
    public void GetShortName_WithSeniorRange_ShouldReturnSenior()
    {
        // Act
        var result = AgeRange.Senior.GetShortName();

        // Assert
        result.Should().Be("Senior");
    }

    [Fact]
    public void GetShortName_WithAdultRange_ShouldReturnDorosły()
    {
        // Act
        var result = AgeRange.Adult.GetShortName();

        // Assert
        result.Should().Be("Dorosły");
    }

    [Fact]
    public void GetShortName_WithAllAgesRange_ShouldReturnWszystkie()
    {
        // Act
        var result = AgeRange.AllAges.GetShortName();

        // Assert
        result.Should().Be("Wszystkie");
    }

    [Fact]
    public void GetShortName_WithCustomRange_ShouldReturnDescription()
    {
        // Arrange
        var ageRange = new AgeRange(20, 30);

        // Act
        var result = ageRange.GetShortName();

        // Assert
        result.Should().Be("20-30 lat");
    }

    [Fact]
    public void ToString_ShouldReturnDescription()
    {
        // Arrange
        var ageRange = new AgeRange(18, 25);

        // Act
        var result = ageRange.ToString();

        // Assert
        result.Should().Be("18-25 lat");
    }

    [Fact]
    public void Equals_WithSameValues_ShouldReturnTrue()
    {
        // Arrange
        var range1 = new AgeRange(18, 25);
        var range2 = new AgeRange(18, 25);

        // Act & Assert
        range1.Should().Be(range2);
    }

    [Fact]
    public void Equals_WithDifferentValues_ShouldReturnFalse()
    {
        // Arrange
        var range1 = new AgeRange(18, 25);
        var range2 = new AgeRange(18, 30);

        // Act & Assert
        range1.Should().NotBe(range2);
    }

    [Fact]
    public void GetHashCode_WithSameValues_ShouldReturnSameHashCode()
    {
        // Arrange
        var range1 = new AgeRange(18, 25);
        var range2 = new AgeRange(18, 25);

        // Act & Assert
        range1.GetHashCode().Should().Be(range2.GetHashCode());
    }
}
