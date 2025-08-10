using System;

namespace BelieveOrNot.Shared
{
    /// <summary>
    /// Represents a test data transfer object.
    /// </summary>
    public record TestDto
    {
        /// <summary>
        /// Gets or sets the unique identifier for the test.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Gets or sets the name of the test.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Gets or sets the date and time when the test was created.
        /// </summary>
        public DateTime CreatedOn { get; set; }
    }
}
